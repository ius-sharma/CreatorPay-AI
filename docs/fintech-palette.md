# CreatorPay palette: Ink + Cobalt

Preserves the expanded CreatorPay. and collapsed C. wordmarks, proportions and sidebar motion. Changes color hierarchy across landing, authentication and workspace through shared palette.css tokens.

## Reference direction
- Mercury: https://mercury.com/ — reviewer viewed the neutral presentation and focused blue primary actions.
- Ramp: https://ramp.com/ — reviewer viewed restrained white/black surfaces with concentrated accent use.
- Stripe and Wise official pages were read as additional context, not visually sampled. This is an original recommendation, not an extracted competitor palette.

## Palette
Light: canvas #F5F7FA, surface #FFFFFF, ink #17243B, muted #5D6B80, accent #2457D6.
Dark: canvas #101722, surface #172130, ink #EDF2FA, muted #A9B7CC, accent #9AB8FF.
The wordmark remains ink with an accent dot. Primary actions, selected navigation and focus indicators share the accent. Success, warning and error remain green, amber and red; official PayPal colors are unchanged.
Input boundaries use dedicated control-border tokens; decorative dividers stay subtle. Legacy unused components were not restyled.

## Verification
Calculated text contrast: light primary 6.16:1, dark primary 7.97:1; muted text on surface 5.41:1 / 7.97:1; active navigation 5.40:1 / 6.19:1. All 18 sampled text/status/background combinations exceeded 4.5:1. Control-border contrast exceeds 3:1 against canvas/surface.
These are token-pair calculations, not a complete accessibility certification. Fresh visual verification of CreatorPay remains pending because the earlier browser policy restriction was respected. Manually check expanded/collapsed sidebar, landing, login, forms, light/dark and mobile.

Production build (including strict type checks) passed. Preview: http://127.0.0.1:3055.
