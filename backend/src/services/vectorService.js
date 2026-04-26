const supabase = require('../config/supabase');

class VectorService {
  async storeEmbedding(documentId, chunkText, embedding) {
    try {
      const { data, error } = await supabase
        .from('document_embeddings')
        .insert([
          {
            document_id: documentId,
            chunk_text: chunkText,
            embedding: embedding
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw error;
    }
  }

  async searchSimilar(queryEmbedding, limit = 5) {
    try {
      // Using Supabase's vector similarity search
      const { data, error } = await supabase.rpc('search_embeddings', {
        query_embedding: queryEmbedding,
        match_count: limit
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching embeddings:', error);
      throw error;
    }
  }

  async deleteDocumentEmbeddings(documentId) {
    try {
      const { error } = await supabase
        .from('document_embeddings')
        .delete()
        .eq('document_id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting embeddings:', error);
      throw error;
    }
  }
}

module.exports = new VectorService();
