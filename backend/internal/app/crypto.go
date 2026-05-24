package app

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
)

const qrTokenEncryptedPrefix = "encrypted:"

type QRCipher struct {
	key [32]byte
}

func NewQRCipher(hexKey string) (*QRCipher, error) {
	hexKey = strings.TrimSpace(hexKey)
	if hexKey == "" {
		return nil, errors.New("QR_ENCRYPTION_KEY is required")
	}

	decoded, err := hex.DecodeString(hexKey)
	if err != nil {
		return nil, fmt.Errorf("decode QR_ENCRYPTION_KEY: %w", err)
	}
	if len(decoded) != 32 {
		return nil, fmt.Errorf("QR_ENCRYPTION_KEY must decode to 32 bytes, got %d", len(decoded))
	}

	var key [32]byte
	copy(key[:], decoded)
	return &QRCipher{key: key}, nil
}

func (c *QRCipher) Encrypt(plaintext string) (string, error) {
	if c == nil {
		return "", errors.New("QR cipher is nil")
	}

	gcm, err := c.gcm()
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return "", fmt.Errorf("generate QR nonce: %w", err)
	}

	sealed := gcm.Seal(nil, nonce, []byte(plaintext), nil)
	payload := make([]byte, 0, len(nonce)+len(sealed))
	payload = append(payload, nonce...)
	payload = append(payload, sealed...)

	return base64.RawURLEncoding.EncodeToString(payload), nil
}

func (c *QRCipher) Decrypt(ciphertext string) (string, error) {
	if c == nil {
		return "", errors.New("QR cipher is nil")
	}

	payload, err := base64.RawURLEncoding.DecodeString(strings.TrimSpace(ciphertext))
	if err != nil {
		return "", fmt.Errorf("decode QR ciphertext: %w", err)
	}

	gcm, err := c.gcm()
	if err != nil {
		return "", err
	}
	if len(payload) <= gcm.NonceSize() {
		return "", errors.New("QR ciphertext is too short")
	}

	nonce := payload[:gcm.NonceSize()]
	encrypted := payload[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, encrypted, nil)
	if err != nil {
		return "", fmt.Errorf("decrypt QR ciphertext: %w", err)
	}

	return string(plaintext), nil
}

func (c *QRCipher) gcm() (cipher.AEAD, error) {
	block, err := aes.NewCipher(c.key[:])
	if err != nil {
		return nil, fmt.Errorf("create QR cipher: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("create QR GCM: %w", err)
	}
	return gcm, nil
}
