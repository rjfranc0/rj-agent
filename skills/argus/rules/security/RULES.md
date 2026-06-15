# Security Lens

Judge code against the adversary. Every finding answers: who exploits this, how, and what do they gain.

## Method

1. **Trace data flow** — follow every external input from entry point (UI, API, CLI arg, file, message queue, webhook) through middleware and business logic to its sink (query, render, filesystem, shell, outbound request). Hunt for points where privileged paths bypass the controls the standard path enforces (admin SDKs ignoring row-level security, internal endpoints skipping auth middleware, batch jobs trusting their input).
2. **Adversarial framing** — for each touched feature ask: how is this defaced, hijacked, exfiltrated, or abused at scale? Assume the attacker is authenticated as a low-privilege user and reads the source.
3. Report what an adversary can *do*, not what looks untidy. Theoretical weaknesses with no reachable path are carried observations, not findings.

## Principles (OWASP Top 10 backbone, reframed beyond web)

1. **Access control** — every object reference is authorized against the requesting identity, not just authentication. IDOR is the default suspicion for any id-by-parameter lookup. Deny by default; authorization lives server-side, never in the client.
2. **Cryptography & secrets in transit/at rest** — sensitive data is encrypted with current, standard primitives; no homegrown crypto, no deprecated algorithms, no keys derived from constants. Sensitive data not needed is not stored.
3. **Injection** — no external input reaches an interpreter (SQL, shell, HTML, regex, path, eval) unparameterized or unescaped for that exact sink. Parameterization beats sanitization; sanitization beats nothing.
4. **Insecure design** — missing controls, not broken ones: no rate limiting on auth or costly endpoints, no tenant isolation, trust boundaries undefined. Flag the absent control with the abuse it permits.
5. **Misconfiguration** — permissive CORS, verbose errors leaking internals, debug modes reachable, default credentials, overly broad permissions in IaC or container definitions.
6. **Vulnerable & untrusted components** — dependencies with known CVEs, abandoned packages, install scripts, or capabilities far beyond their job. New dependencies in a diff get extra suspicion.
7. **Authentication failures** — weak session handling, missing expiry/rotation, credential comparison vulnerable to timing, password handling outside a vetted KDF, MFA bypass paths.
8. **Integrity failures** — unsigned/unverified updates or artifacts, deserialization of untrusted data, CI/CD steps that execute fetched content.
9. **Logging & monitoring gaps** — security-relevant events (auth failures, permission denials, input rejections) unlogged, or logs that capture secrets/PII. Both directions are findings.
10. **SSRF & outbound trust** — user-influenced URLs fetched server-side without allowlisting; internal services trusted because the call "comes from inside."

## Severity Guide

- **blocker** — exploitable now by a plausible adversary: injection with a reachable path, missing authz on a real resource, secret exposure
- **high** — exploitable with preconditions, or a missing control on a sensitive surface
- **medium** — defense-in-depth gap; exploitation requires another failure first
- **low** — hardening opportunity with a concrete, if minor, attack story

No attack story → not a security finding.
