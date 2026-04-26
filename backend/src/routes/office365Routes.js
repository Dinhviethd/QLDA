const express = require('express');
const office365Service = require('../services/office365Service');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Office 365 Integration Routes
 */

// Authorization
router.get('/auth/url', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7);
    const authUrl = office365Service.getAuthUrl(state);
    res.json({ authUrl, state });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

router.post('/auth/callback', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const { access_token, refresh_token } = await office365Service.getAccessToken(code);
    
    res.json({
      message: 'Office 365 authentication successful',
      accessToken: access_token,
      refreshToken: refresh_token
    });
  } catch (error) {
    console.error('Error in auth callback:', error);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

// User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const profile = await office365Service.getUserProfile(accessToken);
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Calendar
router.get('/calendar/events', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.body;
    const limit = req.query.limit || 10;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const events = await office365Service.getCalendarEvents(accessToken, parseInt(limit));
    res.json({ events });
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ error: 'Failed to get calendar events' });
  }
});

router.post('/calendar/events', authMiddleware, async (req, res) => {
  try {
    const { accessToken, eventData } = req.body;

    if (!accessToken || !eventData) {
      return res.status(400).json({ error: 'Access token and event data required' });
    }

    const event = await office365Service.createCalendarEvent(accessToken, eventData);
    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Email
router.get('/email/inbox', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.body;
    const limit = req.query.limit || 10;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const emails = await office365Service.getEmails(accessToken, parseInt(limit));
    res.json({ emails });
  } catch (error) {
    console.error('Error getting emails:', error);
    res.status(500).json({ error: 'Failed to get emails' });
  }
});

router.post('/email/send', authMiddleware, async (req, res) => {
  try {
    const { accessToken, emailData } = req.body;

    if (!accessToken || !emailData) {
      return res.status(400).json({ error: 'Access token and email data required' });
    }

    await office365Service.sendEmail(accessToken, emailData);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.get('/email/search', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { q, limit = 10 } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await office365Service.searchOutlook(accessToken, q, parseInt(limit));
    res.json({ results });
  } catch (error) {
    console.error('Error searching emails:', error);
    res.status(500).json({ error: 'Failed to search emails' });
  }
});

// OneDrive
router.get('/files', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.body;
    const limit = req.query.limit || 20;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const files = await office365Service.getOneDriveFiles(accessToken, parseInt(limit));
    res.json({ files });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

router.post('/files/upload', authMiddleware, async (req, res) => {
  try {
    const { accessToken, fileName, fileContent } = req.body;

    if (!accessToken || !fileName || !fileContent) {
      return res.status(400).json({ error: 'Access token, file name, and content required' });
    }

    const result = await office365Service.uploadToOneDrive(accessToken, fileName, fileContent);
    res.status(201).json({ message: 'File uploaded', result });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Teams
router.get('/teams/presence', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const presence = await office365Service.getTeamsPresence(accessToken);
    res.json(presence);
  } catch (error) {
    console.error('Error getting Teams presence:', error);
    res.status(500).json({ error: 'Failed to get presence' });
  }
});

router.post('/teams/meeting', authMiddleware, async (req, res) => {
  try {
    const { accessToken, meetingData } = req.body;

    if (!accessToken || !meetingData) {
      return res.status(400).json({ error: 'Access token and meeting data required' });
    }

    const meeting = await office365Service.createTeamsMeeting(accessToken, meetingData);
    res.status(201).json({ message: 'Meeting created', meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

module.exports = router;
