with open('logits_output.txt', 'rb') as f:
    content = f.read()
    # Try different encodings
    for encoding in ['utf-16', 'utf-16le', 'utf-8']:
        try:
            text = content.decode(encoding)
            print(f"--- Encoding: {encoding} ---")
            print(text)
            break
        except:
            continue
