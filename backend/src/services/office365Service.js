const axios = require('axios');
const { InMemoryCache, getMsalConfig } = require('@azure/msal-node');

/**
 * Office 365 Integration Service
 * Handles authentication, email, calendar, and file operations with Office 365
 */

class Office365Service {
  constructor() {
    this.clientId = process.env.OFFICE_CLIENT_ID;
    this.clientSecret = process.env.OFFICE_CLIENT_SECRET;
    this.tenantId = process.env.OFFICE_TENANT_ID;
    this.redirectUri = process.env.OFFICE_REDIRECT_URI || 'http://localhost:3000/auth/callback';
    this.graphApiUrl = 'https://graph.microsoft.com/v1.0';
    this.tokenCache = new Map();
  }

  /**
   * Generate Office 365 auth URL
   */
  getAuthUrl(state = '') {
    const scope = encodeURIComponent(
      'Calendars.Read Calendars.ReadWrite Mail.Read Mail.Send Files.Read Files.ReadWrite offline_access'
    );
    
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${this.clientId}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${state}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
          scope: 'Calendars.Read Calendars.ReadWrite Mail.Read Mail.Send Files.Read Files.ReadWrite'
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      
      // Cache token
      this.tokenCache.set('access_token', {
        token: access_token,
        expiresAt: Date.now() + expires_in * 1000
      });

      if (refresh_token) {
        this.tokenCache.set('refresh_token', refresh_token);
      }

      return { access_token, refresh_token, expires_in };
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: 'Calendars.Read Calendars.ReadWrite Mail.Read Mail.Send Files.Read Files.ReadWrite'
        }
      );

      const { access_token, expires_in } = response.data;
      
      this.tokenCache.set('access_token', {
        token: access_token,
        expiresAt: Date.now() + expires_in * 1000
      });

      return access_token;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Make authenticated request to Microsoft Graph API
   */
  async makeGraphRequest(endpoint, method = 'GET', data = null, accessToken) {
    try {
      const config = {
        method,
        url: `${this.graphApiUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Graph API error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken) {
    return this.makeGraphRequest('/me', 'GET', null, accessToken);
  }

  /**
   * Get user's calendar events
   */
  async getCalendarEvents(accessToken, limit = 10) {
    try {
      const response = await this.makeGraphRequest(
        `/me/calendarview?$top=${limit}&$orderby=start/dateTime`,
        'GET',
        null,
        accessToken
      );
      return response.value || [];
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(accessToken, eventData) {
    try {
      return await this.makeGraphRequest(
        '/me/events',
        'POST',
        {
          subject: eventData.subject,
          start: { dateTime: eventData.startTime, timeZone: 'UTC' },
          end: { dateTime: eventData.endTime, timeZone: 'UTC' },
          body: { contentType: 'HTML', content: eventData.description || '' },
          isReminderOn: true,
          reminderMinutesBeforeStart: 15,
          categories: eventData.categories || []
        },
        accessToken
      );
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Get emails from inbox
   */
  async getEmails(accessToken, limit = 10) {
    try {
      const response = await this.makeGraphRequest(
        `/me/mailFolders/inbox/messages?$top=${limit}&$orderby=receivedDateTime desc`,
        'GET',
        null,
        accessToken
      );
      return response.value || [];
    } catch (error) {
      console.error('Error getting emails:', error);
      throw error;
    }
  }

  /**
   * Send email
   */
  async sendEmail(accessToken, emailData) {
    try {
      return await this.makeGraphRequest(
        '/me/sendMail',
        'POST',
        {
          message: {
            subject: emailData.subject,
            body: {
              contentType: 'HTML',
              content: emailData.body
            },
            toRecipients: emailData.recipients.map(email => ({
              emailAddress: { address: email }
            })),
            ccRecipients: (emailData.cc || []).map(email => ({
              emailAddress: { address: email }
            })),
            bccRecipients: (emailData.bcc || []).map(email => ({
              emailAddress: { address: email }
            }))
          },
          saveToSentItems: true
        },
        accessToken
      );
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Get OneDrive files
   */
  async getOneDriveFiles(accessToken, limit = 20) {
    try {
      const response = await this.makeGraphRequest(
        `/me/drive/root/children?$top=${limit}`,
        'GET',
        null,
        accessToken
      );
      return response.value || [];
    } catch (error) {
      console.error('Error getting OneDrive files:', error);
      throw error;
    }
  }

  /**
   * Upload file to OneDrive
   */
  async uploadToOneDrive(accessToken, fileName, fileContent) {
    try {
      return await this.makeGraphRequest(
        `/me/drive/root:/${fileName}:/content`,
        'PUT',
        fileContent,
        accessToken
      );
    } catch (error) {
      console.error('Error uploading file to OneDrive:', error);
      throw error;
    }
  }

  /**
   * Search Outlook
   */
  async searchOutlook(accessToken, searchQuery, limit = 10) {
    try {
      const response = await this.makeGraphRequest(
        `/me/messages?$search="${searchQuery}"&$top=${limit}`,
        'GET',
        null,
        accessToken
      );
      return response.value || [];
    } catch (error) {
      console.error('Error searching Outlook:', error);
      throw error;
    }
  }

  /**
   * Get Teams presence
   */
  async getTeamsPresence(accessToken) {
    try {
      return await this.makeGraphRequest(
        '/me/presence',
        'GET',
        null,
        accessToken
      );
    } catch (error) {
      console.error('Error getting Teams presence:', error);
      throw error;
    }
  }

  /**
   * Create Teams meeting
   */
  async createTeamsMeeting(accessToken, meetingData) {
    try {
      return await this.makeGraphRequest(
        '/me/onlineMeetings',
        'POST',
        {
          subject: meetingData.subject,
          startDateTime: meetingData.startTime,
          endDateTime: meetingData.endTime,
          participants: {
            attendees: (meetingData.attendees || []).map(email => ({
              emailAddress: { address: email },
              type: 'required'
            }))
          }
        },
        accessToken
      );
    } catch (error) {
      console.error('Error creating Teams meeting:', error);
      throw error;
    }
  }
}

module.exports = new Office365Service();
