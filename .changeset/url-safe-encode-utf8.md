---
'@aws-amplify/core': patch
---

fix(core): hex-encode `urlSafeEncode` over UTF-8 bytes so `urlSafeDecode` returns the original string, instead of corrupting every character above U+00FF in the OAuth `customState`
