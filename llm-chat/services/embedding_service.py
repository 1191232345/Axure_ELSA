import numpy as np
from functools import lru_cache
import threading
import time

try:
    from sentence_transformers import SentenceTransformer
    EMBEDDING_AVAILABLE = True
except ImportError:
    EMBEDDING_AVAILABLE = False
    print("警告: sentence-transformers 未安装，embedding 功能不可用")

class EmbeddingService:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.model = None
            self.model_name = 'BAAI/bge-m3'
            self.cache = {}
            self.cache_lock = threading.Lock()
            self.max_cache_size = 1000
            self.initialized = True
    
    def load_model(self, model_name=None):
        if not EMBEDDING_AVAILABLE:
            raise RuntimeError("sentence-transformers 未安装，无法加载模型")
        
        if model_name:
            self.model_name = model_name
        
        if self.model is None:
            print(f"正在加载 embedding 模型: {self.model_name}")
            start_time = time.time()
            self.model = SentenceTransformer(self.model_name)
            load_time = time.time() - start_time
            print(f"模型加载完成，耗时: {load_time:.2f}秒")
        
        return self.model
    
    def get_embedding(self, text, use_cache=True):
        if not EMBEDDING_AVAILABLE:
            raise RuntimeError("sentence-transformers 未安装，无法生成 embedding")
        
        if use_cache:
            with self.cache_lock:
                if text in self.cache:
                    return self.cache[text]
        
        self.load_model()
        
        embedding = self.model.encode(text, normalize_embeddings=True)
        
        if use_cache:
            with self.cache_lock:
                if len(self.cache) >= self.max_cache_size:
                    self._evict_cache()
                self.cache[text] = embedding
        
        return embedding
    
    def get_embeddings_batch(self, texts, use_cache=True):
        if not EMBEDDING_AVAILABLE:
            raise RuntimeError("sentence-transformers 未安装，无法生成 embedding")
        
        embeddings = []
        uncached_texts = []
        uncached_indices = []
        
        if use_cache:
            with self.cache_lock:
                for i, text in enumerate(texts):
                    if text in self.cache:
                        embeddings.append(self.cache[text])
                    else:
                        embeddings.append(None)
                        uncached_texts.append(text)
                        uncached_indices.append(i)
        else:
            uncached_texts = texts
            uncached_indices = list(range(len(texts)))
            embeddings = [None] * len(texts)
        
        if uncached_texts:
            self.load_model()
            new_embeddings = self.model.encode(uncached_texts, normalize_embeddings=True)
            
            if use_cache:
                with self.cache_lock:
                    if len(self.cache) + len(uncached_texts) > self.max_cache_size:
                        self._evict_cache(len(uncached_texts))
                    
                    for text, embedding in zip(uncached_texts, new_embeddings):
                        self.cache[text] = embedding
            
            for idx, embedding in zip(uncached_indices, new_embeddings):
                embeddings[idx] = embedding
        
        return np.array(embeddings)
    
    def _evict_cache(self, space_needed=1):
        evict_count = max(space_needed, len(self.cache) // 4)
        keys_to_evict = list(self.cache.keys())[:evict_count]
        for key in keys_to_evict:
            del self.cache[key]
    
    def clear_cache(self):
        with self.cache_lock:
            self.cache.clear()
    
    def get_cache_size(self):
        with self.cache_lock:
            return len(self.cache)
    
    def is_available(self):
        return EMBEDDING_AVAILABLE

embedding_service = EmbeddingService()