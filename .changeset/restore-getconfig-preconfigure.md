---
"aws-amplify": patch
---

fix(core): restore empty-config return from `Amplify.getConfig()` before `configure()`

`Amplify.getConfig()` on the `aws-amplify` umbrella facade again returns an empty config (`{}`) with a warning when `Amplify.configure()` has not been called, instead of throwing `NoAmplifyContextError`. This restores the released 6.20.0 public contract that was unintentionally changed by the explicit-AmplifyContext migration (#14931).
