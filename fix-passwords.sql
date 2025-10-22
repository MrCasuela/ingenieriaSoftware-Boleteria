-- Actualizar contraseñas con hashes correctos
UPDATE users SET password='$2a$10$aD8dbCmB5R/gLptk/cYszuqy0MRwnWNJXHzgFXc1z0Gm.hGK.JXFW' WHERE email='admin1@ticketvue.com';
UPDATE users SET password='$2a$10$l5a1JWgUOqX1vogEclSzPe4im38jGjmqTFvZYKIJOBrV9tMS8HlR6' WHERE email='operador1@ticketvue.com';
SELECT email, LEFT(password, 40) AS password_hash FROM users WHERE email IN ('admin1@ticketvue.com', 'operador1@ticketvue.com');
