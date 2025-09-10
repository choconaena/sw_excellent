from keybert import KeyBERT

kw_model = KeyBERT()
text = "I am studying machine learning and artificial intelligence."
keywords = kw_model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words='english')
print(keywords)
