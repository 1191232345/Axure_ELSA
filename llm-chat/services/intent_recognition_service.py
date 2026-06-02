import numpy as np
import time
from services.embedding_service import embedding_service
from models.intent import (
    get_all_active_samples,
    get_intent_category_by_id,
    get_all_intent_configs,
    create_intent_recognition_log
)

class IntentRecognitionService:
    def __init__(self):
        self.embedding_service = embedding_service
        self.sample_embeddings_cache = None
        self.sample_data_cache = None
        self.cache_timestamp = None
        self.cache_ttl = 300
    
    def calculate_similarity(self, query_embedding, sample_embeddings):
        similarities = np.dot(sample_embeddings, query_embedding)
        return similarities
    
    def softmax(self, x):
        exp_x = np.exp(x - np.max(x))
        return exp_x / exp_x.sum()
    
    def get_cached_samples(self):
        current_time = time.time()
        
        if self.sample_data_cache and self.cache_timestamp:
            if current_time - self.cache_timestamp < self.cache_ttl:
                return self.sample_data_cache, self.sample_embeddings_cache
        
        samples = get_all_active_samples()
        
        if not samples:
            return [], None
        
        sample_texts = [sample['sample_text'] for sample in samples]
        sample_embeddings = self.embedding_service.get_embeddings_batch(sample_texts)
        
        self.sample_data_cache = samples
        self.sample_embeddings_cache = sample_embeddings
        self.cache_timestamp = current_time
        
        return samples, sample_embeddings
    
    def refresh_cache(self):
        self.sample_data_cache = None
        self.sample_embeddings_cache = None
        self.cache_timestamp = None
    
    def recognize_intent(self, query_text, top_k=5, min_confidence=0.0):
        start_time = time.time()
        
        if not self.embedding_service.is_available():
            return {
                'error': 'Embedding 服务不可用',
                'recognized_intents': [],
                'processing_time': 0
            }
        
        if len(query_text) > 500:
            query_text = query_text[:500]
        
        samples, sample_embeddings = self.get_cached_samples()
        
        if not samples:
            return {
                'recognized_intents': [],
                'processing_time': time.time() - start_time,
                'message': '没有可用的意图样本'
            }
        
        query_embedding = self.embedding_service.get_embedding(query_text)
        
        similarities = self.calculate_similarity(query_embedding, sample_embeddings)
        
        confidence_scores = self.softmax(similarities)
        
        results = []
        for i, score in enumerate(confidence_scores):
            sample = samples[i]
            results.append({
                'category_id': sample['category_id'],
                'category_name': sample['category_name'],
                'confidence': float(score),
                'similarity': float(similarities[i]),
                'sample_text': sample['sample_text']
            })
        
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        filtered_results = []
        for result in results:
            if result['confidence'] >= min_confidence:
                category = get_intent_category_by_id(result['category_id'])
                if category:
                    category_threshold = category.get('confidence_threshold', 0.7)
                    if result['confidence'] >= category_threshold:
                        filtered_results.append(result)
        
        filtered_results = filtered_results[:top_k]
        
        processing_time = time.time() - start_time
        
        if filtered_results:
            top_intent = filtered_results[0]
            create_intent_recognition_log(
                query_text,
                top_intent['category_id'],
                top_intent['confidence'],
                filtered_results
            )
        
        return {
            'recognized_intents': filtered_results,
            'processing_time': processing_time,
            'total_samples': len(samples)
        }
    
    def recognize_intent_batch(self, query_texts, top_k=5, min_confidence=0.0):
        results = []
        for text in query_texts:
            result = self.recognize_intent(text, top_k, min_confidence)
            results.append({
                'input_text': text,
                **result
            })
        return results

intent_recognition_service = IntentRecognitionService()