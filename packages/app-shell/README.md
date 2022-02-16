### DidComm Packing
INPUT

```json
{
  "packing": "authcrypt",
  "message": {
    "type": "application/didcomm-encrypted+json",
    "to": "did:web:issuer.example.com:users:banana",
    "from": "did:web:issuer.example.com",
    "id": "123123123",
    "body": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiUHJvZmlsZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJ1c2VyX2lkIjoiMDcwMzQyIn19LCJzdWIiOiJkaWQ6d2ViOmlzc3Vlci5leGFtcGxlLmNvbTp1c2VyczpiYW5hbmEiLCJuYmYiOjE2MjczMTIzODgsImlzcyI6ImRpZDp3ZWI6aXNzdWVyLmV4YW1wbGUuY29tIn0.7uJt2r8GVvh5iX7d2cpbdrl5n7XFrNzvWiVFbl09USfLLWulihbbInLwMjIxlQykccQkpjku4zsti85uf-EWCQ"
  }
}
```

OUTPUT

```json
{
  "ciphertext": "kg0347geKXcwh5yQlVqUl929qQGNLqYNBd1frYeP2sVK37RyoOCY-O6VnXHVUVMZnpE8KlbGgm4lFJb0QUcRsw30NFz0oubeP1NLBTqhX4aqVVtihx3lHxVXErqn3HQdvHbOPAccYqX_5NIT12TFGpcqjJP3M9r6FaM5zPGteVAk05IXYA7MizCRIlRzR5zPT5xd9DZaHDzZumI4gKHgCZxOeaY_WBzpo2FZIUqD4TBdiNrtn8y7YvO3fPBIzgR-7wtQqXBQvTJbL6lCxGO4W5QIJFuE0b8L9q3EI55KBb66MkTvXT8atDrJbiTv680QcTRXn1w7GFTX0laIdMnIDv1W85mzrmtAFn7kYuZdac6wbyJPR7s8yD4BHB9wPu0bHdrtXe9q9D7l4yqn-coP9rEklaVmp_Rp9sSaZ863uXwm9STVCb5H6wN_zc0IOzsBpwQUm8RKC4KFDRi0aOh84yZ3XE6ZD7eIoB0aARe8qGeRzkLQ5BmYiWfJ1QRJSzRBoXIUpxUhX_e8wlJ3CHJnKruk3yNsY8UtaToZNOjr0bs2XrrkSmKf9GQUfycNCEzeyWWO4eDQkgJ4Bhe7KhhiCCmU-3a2CX93orLVFTPXNA8YV_s9EUPq1FRiq-SnEac2HROXcN4ifeAc6Bba3k47-NOpu_qQBqMDrLt_tvzWM_L-98tgS9MN17oOL3aGAxZ08Ca4rXOpx7MAEmEKCOJda8uRbqTDoHxAHiWweD7KNaCwgV5Atv4eXDZFjO0Y0a6cJFIufsM6X-gKbiue9Faxua7yoJ6utcoSWrBnIiXA",
  "iv": "ynLu_fvvtO5E6NARXhQVU6QbpwPwB3Yk",
  "protected": "eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwic2tpZCI6ImRpZDp3ZWI6aXNzdWVyLmV4YW1wbGUuY29tI2NjODBkY2QwMWI5YWU2YWU3MWIwNWEyZGY0MzYwMWMzNTA4ODVkY2QwYjk5ZmZiNmM1YTg1ODY4ZjA4N2E1MmIiLCJlbmMiOiJYQzIwUCJ9",
  "recipients": [
    {
      "encrypted_key": "xwGSyDJKWfPytCnAustgK9lf4d_M933cN1VFz5x7MpA",
      "header": {
        "alg": "ECDH-1PU+XC20PKW",
        "epk": {
          "crv": "X25519",
          "kty": "OKP",
          "x": "3jyJci44SKvE5fMha64Ho11XE7va2Uby3ISqf6LC1yg"
        },
        "iv": "LeR6SLF7iehZZlpKWrmq5kxNzL-sG3Dl",
        "kid": "did:web:issuer.example.com:users:banana#6e2a516ba75ba9283fc0ec6be21d8b15a8f6646063babe2bde3162b5f395d5e7",
        "tag": "OuUAvtdrfoxEJIY9QOapvw"
      }
    }
  ],
  "tag": "ZjQCYwOVWyTR1eQPdnJ2Ig"
}
```
