// const alpha = 'ivxlcdm';
// const symbols = '!#$%&?@';

// // --- HELPER FUNCTIONS ---
// const toRome = (num) => {
//     const map = { m: 1000, cm: 900, d: 500, cd: 400, c: 100, xc: 90, l: 50, xl: 40, x: 10, ix: 9, v: 5, iv: 4, i: 1 };
//     let str = '';
//     for (let i in map) { while (num >= map[i]) { str += i; num -= map[i]; } }
//     return str;
// };

// const fromRome = (str) => {
//     const map = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
//     let res = 0;
//     for (let i = 0; i < str.length; i++) {
//         let s1 = map[str[i]], s2 = map[str[i+1]];
//         if (s2 > s1) { res += s2 - s1; i++; } else { res += s1; }
//     }
//     return res || 0;
// };

// // --- BATCH PROCESSOR ---

// // const RavProcessor = {
// //     getKeyFactor: (key) => key.split('').reduce((a, b) => a + b.charCodeAt(0), 0),

// //     encryptBatch: function(messages, key) {
// //         const factor = this.getKeyFactor(key);
// //         return messages.map(msg => {
// //             // Step 1: Core rav_s
// //             let data = msg.split('').map(c => toRome(c.charCodeAt(0))).reverse().join('+');
// //             data = data.split('').map(c => symbols[alpha.indexOf(c)] || c).join('');

// //             // Step 2: 3-Round Keyed Loop
// //             for (let i = 1; i <= 8; i++) {
// //                 let s = (factor + i) % data.length;
// //                 data = data.substring(s) + data.substring(0, s);
// //                 let mid = Math.floor(data.length / 2);
// //                 data = data.substring(mid) + data.substring(0, mid);
// //             }
// //             return data;
// //         });
// //     },

// //     decryptBatch: function(ciphers, key) {
// //         const factor = this.getKeyFactor(key);
// //         return ciphers.map(cipher => {
// //             let data = cipher;
// //             try {
// //                 for (let i = 8; i >= 1; i--) {
// //                     let mid = data.length - Math.floor(data.length / 2);
// //                     data = data.substring(mid) + data.substring(0, mid);
// //                     let s = (factor + i) % data.length;
// //                     data = data.substring(data.length - s) + data.substring(0, data.length - s);
// //                 }
// //                 data = data.split('').map(c => alpha[symbols.indexOf(c)] || c).join('');
// //                 return data.split('+').reverse().map(r => String.fromCharCode(fromRome(r))).join('');
// //             } catch (e) {
// //                 return "[DECODE_ERROR]";
// //             }
// //         });
// //     }
// // };

// // const RavProcessor = {
// //     // Generate a random 4-character salt
// //     generateSalt: () => Math.random().toString(36).substring(2, 6),

// //     getKeyFactor: (key, salt) => {
// //         const combined = key + salt;
// //         return combined.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
// //     },

// //     encryptBatch: function(messages, key) {
// //         return messages.map(msg => {
// //             const salt = this.generateSalt();
// //             const factor = this.getKeyFactor(key, salt);
            
// //             // Step 1: Core conversion
// //             let data = msg.split('').map(c => toRome(c.charCodeAt(0))).reverse().join('+');
// //             data = data.split('').map(c => symbols[alpha.indexOf(c)] || c).join('');

// //             // Step 2: 8-Round Keyed Loop
// //             for (let i = 1; i <= 8; i++) {
// //                 let s = (factor + i) % data.length;
// //                 data = data.substring(s) + data.substring(0, s);
// //                 let mid = Math.floor(data.length / 2);
// //                 data = data.substring(mid) + data.substring(0, mid);
// //             }
            
// //             // Step 3: Attach salt to the front so we can use it for decryption
// //             return salt + ":" + data;
// //         });
// //     },

// //     decryptBatch: function(ciphers, key) {
// //         return ciphers.map(cipher => {
// //             // Extract the salt from the start
// //             const [salt, encryptedData] = cipher.split(':');
// //             const factor = this.getKeyFactor(key, salt);
// //             let data = encryptedData;

// //             try {
// //                 for (let i = 8; i >= 1; i--) {
// //                     let mid = data.length - Math.floor(data.length / 2);
// //                     data = data.substring(mid) + data.substring(0, mid);
// //                     let s = (factor + i) % data.length;
// //                     data = data.substring(data.length - s) + data.substring(0, data.length - s);
// //                 }
// //                 data = data.split('').map(c => alpha[symbols.indexOf(c)] || c).join('');
// //                 return data.split('+').reverse().map(r => String.fromCharCode(fromRome(r))).join('');
// //             } catch (e) {
// //                 return "[DECODE_ERROR]";
// //             }
// //         });
// //     }
// // };

// const RavProcessor = {
//     // 1. PRE-CALCULATED DATA
//     // Primes used for salt injection locations
//     primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37],

//     // 2. UTILS
//     generateSalt: (len) => Math.random().toString(36).substring(2, 2 + len),
    
//     getKeyFactor: (key, salt) => (key + salt).split('').reduce((a, b) => a + b.charCodeAt(0), 0),

//     getChecksum: (str) => {
//         let sum = 0;
//         for (let i = 0; i < str.length; i++) {
//             sum = (sum + str.charCodeAt(i) * (i + 1)) % 999;
//         }
//         return sum.toString().padStart(3, '0');
//     },

//     // 3. MAIN METHODS
//     encryptBatch: function(messages, key) {
//         return messages.map(msg => {
//             // Guard: Handle empty strings or non-string inputs
//             if (!msg || typeof msg !== 'string') return "";

//             const checksum = this.getChecksum(msg);
//             const salt = this.generateSalt(6);
//             const factor = this.getKeyFactor(key, salt);
            
//             // Step 1: Roman + Symbol Conversion (The Tank)
//             let data = (checksum + msg).split('').map(c => toRome(c.charCodeAt(0))).reverse().join('+');
//             data = data.split('').map(c => symbols[alpha.indexOf(c)] || c).join('');

//             // Step 2: 8-Round Shuffling
//             for (let i = 1; i <= 8; i++) {
//                 let s = (factor + i) % data.length;
//                 data = data.substring(s) + data.substring(0, s);
//                 let mid = Math.floor(data.length / 2);
//                 data = data.substring(mid) + data.substring(0, mid);
//             }

//             // Step 3: Salt Injection at Pre-calculated Primes
//             let resArr = data.split('');
//             salt.split('').forEach((char, idx) => {
//                 let pos = this.primes[idx];
//                 // Ensure we don't try to inject past the string length
//                 if (pos < resArr.length) resArr.splice(pos, 0, char);
//             });

//             return resArr.join('');
//         });
//     },

//     decryptBatch: function(ciphers, key) {
//         return ciphers.map(cipher => {
//             if (!cipher) return "";
            
//             let tempArr = cipher.split('');
//             let salt = "";

//             // Step 1: Extract Salt from Primes (Backwards to keep indexes valid)
//             for (let i = 5; i >= 0; i--) {
//                 let pos = this.primes[i];
//                 if (pos < tempArr.length) {
//                     salt = tempArr.splice(pos, 1) + salt;
//                 }
//             }

//             const factor = this.getKeyFactor(key, salt);
//             let data = tempArr.join('');

//             try {
//                 // Step 2: Reverse 8-Round Shuffling
//                 for (let i = 8; i >= 1; i--) {
//                     let mid = data.length - Math.floor(data.length / 2);
//                     data = data.substring(mid) + data.substring(0, mid);
//                     let s = (factor + i) % data.length;
//                     data = data.substring(data.length - s) + data.substring(0, data.length - s);
//                 }

//                 // Step 3: Symbol + Roman Reversal
//                 data = data.split('').map(c => alpha[symbols.indexOf(c)] || c).join('');
//                 let fullStr = data.split('+').reverse().map(r => String.fromCharCode(fromRome(r))).join('');

//                 // Step 4: Integrity Check
//                 const extractedSum = fullStr.substring(0, 3);
//                 const originalMsg = fullStr.substring(3);
                
//                 return (this.getChecksum(originalMsg) === extractedSum) 
//                     ? originalMsg 
//                     : "[CORRUPTED_OR_WRONG_KEY]";
//             } catch (e) {
//                 return "[DECODE_ERROR]";
//             }
//         });
//     }
// };

// const RavProcessor = {
//     // 1. Helper to turn a password string into a usable CryptoKey
//     async deriveKey(password, salt) {
//         const encoder = new TextEncoder();
//         const baseKey = await window.crypto.subtle.importKey(
//             "raw", 
//             encoder.encode(password), 
//             "PBKDF2", 
//             false, 
//             ["deriveKey"]
//         );
//         return window.crypto.subtle.deriveKey(
//             { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
//             baseKey,
//             { name: "AES-GCM", length: 256 },
//             false, 
//             ["encrypt", "decrypt"]
//         );
//     },

//     // 2. The Main Encryption Method
//     async encryptBatch(messages, password) {
//         const encoder = new TextEncoder();
//         const salt = window.crypto.getRandomValues(new Uint8Array(16));
//         const key = await this.deriveKey(password, salt);

//         return Promise.all(messages.map(async (msg) => {
//             const iv = window.crypto.getRandomValues(new Uint8Array(12));
//             const encryptedBuffer = await window.crypto.subtle.encrypt(
//                 { name: "AES-GCM", iv: iv },
//                 key,
//                 encoder.encode(msg)
//             );

//           // Convert buffers to Base64 instead of Hex
//             const saltB64 = btoa(String.fromCharCode(...salt));
//             const ivB64 = btoa(String.fromCharCode(...iv));
//             const contentB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

//             // Using backticks for the "cure" against whitespace
//             return `${saltB64}:${ivB64}:${contentB64}`;
//         }));
//     },

//     // 3. The Main Decryption Method (Now correctly inside the object)
// async decryptBatch(encryptedMessages, password) {
//         const decoder = new TextDecoder();
        
//         // Helper to convert Base64 back to Uint8Array
//         const b64ToUint8 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

//         return Promise.all(encryptedMessages.map(async (entry) => {
//             try {
//                 // Split the string and trim any accidental whitespace
//                 const [saltB64, ivB64, contentB64] = entry.trim().split(':');

//                 const salt = b64ToUint8(saltB64);
//                 const iv = b64ToUint8(ivB64);
//                 const encryptedData = b64ToUint8(contentB64);

//                 const key = await this.deriveKey(password, salt);

//                 const decryptedBuffer = await window.crypto.subtle.decrypt(
//                     { name: "AES-GCM", iv: iv },
//                     key,
//                     encryptedData
//                 );

//                 return decoder.decode(decryptedBuffer);
//             } catch (e) {
//                 console.error("Decryption failed:", e);
//                 return null;
//             }
//         }));
//     }

// }; // <--- The object ends here

// // 4. The Test Function
// async function test() {
//     const pass = "mySecretKey";
//     const msgs = [`Nestašice dizela

// Na nekim benzinskima pojavio se i problem nestašice dizela, prije svega plavog.
// U Zagrebu na Ininoj benzinskoj u Vukovarskoj nedaleko od Lisinskog stoji obavijest da nema Eurodizela, sami smo se mogli uvjeriti danas nešto prije 18 sati. Na ulazu
//  u benzinsku piše i da se Class Premium dizel toči po cijeni običnog toči na dva agregata. `];
    
//     console.log("Starting encryption...");
//     const encrypted = await RavProcessor.encryptBatch(msgs, pass);
//     console.log("Encrypted Sample:", encrypted[0]);
    
//     console.log("Starting decryption...");
//     const decrypted = await RavProcessor.decryptBatch(encrypted, pass);
//     console.log("Decrypted Results:", decrypted);
// }

// test();

// function checkPasswordStrength(pass) {
//         let score = 0;
//         if (!pass) return { score: 0, label: "Empty" };

//         if (pass.length > 8) score++;
//         if (pass.length > 12) score++;
//         if (/[A-Z]/.test(pass)) score++; // Has Uppercase
//         if (/[0-9]/.test(pass)) score++; // Has Numbers
//         if (/[^A-Za-z0-9]/.test(pass)) score++; // Has Special Chars

//         const labels = ["Dangerous", "Very Weak", "Weak", "Medium", "Strong", "Unbreakable"];
//         return {
//             score: score,
//             label: labels[score],
//             color: score < 3 ? "red" : score < 5 ? "orange" : "green"
//         };
//     }
