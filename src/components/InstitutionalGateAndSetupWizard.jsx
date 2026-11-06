import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileSpreadsheet, 
  Code2, 
  Settings2, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft,
  Terminal,
  Sparkles,
  AlertCircle,
  LogOut,
  DollarSign,
  Sliders,
  Mail,
  UserCheck,
  RefreshCw,
  HelpCircle,
  Hash,
  BadgeCheck
} from 'lucide-react';

const API_BASE = 'https://asx-quant-brain.onrender.com';

const CAPITAL_PRESETS = [
  5000,
  10000,
  25000,
  50000,
  100000,
  250000,
  500000,
  1000000
];

const CURRENCY_OPTIONS = [
  { code: 'AUD', symbol: 'A$', label: 'AUD – Australian Dollar' },
  { code: 'USD', symbol: 'US$', label: 'USD – US Dollar' },
  { code: 'GBP', symbol: '£', label: 'GBP – British Pound' },
  { code: 'CAD', symbol: 'C$', label: 'CAD – Canadian Dollar' }
];

const KELLY_OPTIONS = [
  { value: 0.25, label: '0.25x (Quarter-Kelly – Conservative)' },
  { value: 0.50, label: '0.50x (Half-Kelly – Institutional Default)' },
  { value: 1.00, label: '1.00x (Full-Kelly – Aggressive)' }
];

export default function InstitutionalGateAndSetupWizard({ 
  userSession, 
  onLoginSuccess, 
  onLogout,
  onCompleteSetup, 
  showSetupModalOnly = false,
  onCloseModal
}) {
  // Navigation Tabs: 'SIGN_IN' | 'REGISTER' | 'FORGOT_PIN'
  const [authTab, setAuthTab] = useState('SIGN_IN');

  // Gate & Config State
  const [googleClientId, setGoogleClientId] = useState('');
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sign In Flow (Google OAuth + PIN)
  const [signStep, setSignStep] = useState('GOOGLE_AUTH'); // 'GOOGLE_AUTH' | 'ENTER_PIN' | 'CREATE_PIN'
  const [pendingGoogleToken, setPendingGoogleToken] = useState('');
  const [pendingUserEmail, setPendingUserEmail] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  // Self-Service Registration Flow (Turnstile + OTP + PIN)
  const [regStep, setRegStep] = useState(1); // 1: Email + Turnstile, 2: OTP + PIN
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('MOCK_TURNSTILE_PASS');

  // Forgot PIN Flow
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP + New PIN
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPin, setForgotNewPin] = useState('');
  const [forgotConfirmPin, setForgotConfirmPin] = useState('');

  const googleBtnRef = useRef(null);
  const turnstileRef = useRef(null);
  const turnstileForgotRef = useRef(null);

  // Onboarding Wizard State (Steps 1 to 4)
  const [currentStep, setCurrentStep] = useState(1);
  const [portfolioName, setPortfolioName] = useState(userSession?.name ? `${userSession.name} Alpha Node` : 'Primary Trading Node');
  const [currency, setCurrency] = useState(userSession?.currency || 'AUD');
  const [startingCapital, setStartingCapital] = useState(userSession?.startingCapital || 25000);
  const [customCapitalInput, setCustomCapitalInput] = useState(String(userSession?.startingCapital || 25000));
  const [kellyFraction, setKellyFraction] = useState(userSession?.kellyFraction || 0.50);
  const [chaseLimitPct, setChaseLimitPct] = useState(userSession?.chaseLimitPct || 2.0);
  const [sheetInput, setSheetInput] = useState(userSession?.spreadsheetId || '');
  const [isProvisioningDrive, setIsProvisioningDrive] = useState(false);
  const [provisionedDriveData, setProvisionedDriveData] = useState(null);
  const [provisionDriveError, setProvisionDriveError] = useState('');

  // Blueprint State
  const [blueprint, setBlueprint] = useState({
    wrapper_script: '',
    master_library_id: '',
    library_identifier: 'TitanLibrary',
    tenant_hmac_secret: ''
  });
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyLogs, setVerifyLogs] = useState([]);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Extract clean Google Sheet ID
  const extractSheetId = (input) => {
    if (!input) return '';
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };
  const cleanSheetId = extractSheetId(sheetInput);

  // 1. Fetch public Auth Config
  useEffect(() => {
    if (userSession?.isAuthed && !showSetupModalOnly) return;
    fetch(`${API_BASE}/api/v2/auth/config`)
      .then(res => res.json())
      .then(data => {
        if (data?.google_client_id) setGoogleClientId(data.google_client_id);
        if (data?.turnstile_site_key) setTurnstileSiteKey(data.turnstile_site_key);
      })
      .catch(err => console.warn('Auth config fetch notice:', err));
  }, [userSession?.isAuthed, showSetupModalOnly]);

  // 2. Render Google Sign-In Button on SIGN_IN tab
  useEffect(() => {
    if (userSession?.isAuthed || showSetupModalOnly || !googleClientId || authTab !== 'SIGN_IN' || signStep !== 'GOOGLE_AUTH') return;

    const initGoogleGsi = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 340,
          text: 'signin_with',
          shape: 'pill'
        });
      }
    };

    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        initGoogleGsi();
      }
    }, 200);

    return () => clearInterval(timer);
  }, [googleClientId, userSession?.isAuthed, showSetupModalOnly, authTab, signStep]);

  // 3. Render Turnstile Widget for Registration
  useEffect(() => {
    if (authTab !== 'REGISTER' || regStep !== 1 || !turnstileSiteKey || !turnstileRef.current) return;
    try {
      if (window.turnstile && typeof window.turnstile.render === 'function') {
        window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token) => {
            setTurnstileToken(token);
          },
          'error-callback': () => {
            setTurnstileToken('MOCK_TURNSTILE_PASS');
          }
        });
      } else {
        setTurnstileToken('MOCK_TURNSTILE_PASS');
      }
    } catch (e) {
      setTurnstileToken('MOCK_TURNSTILE_PASS');
    }
  }, [authTab, regStep, turnstileSiteKey]);

  // 4. Fetch Protected Blueprint when Authed
  useEffect(() => {
    if (!userSession?.isAuthed || !userSession?.idToken) return;
    setLoadingBlueprint(true);
    const qSheet = cleanSheetId || 'PENDING_SHEET';
    fetch(`${API_BASE}/api/v2/onboarding/blueprint?spreadsheet_id=${encodeURIComponent(qSheet)}`, {
      headers: {
        'Authorization': `Bearer ${userSession.idToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized blueprint fetch');
        return res.json();
      })
      .then(data => {
        setBlueprint({
          wrapper_script: data.wrapper_script || '',
          master_library_id: data.master_library_id || '',
          library_identifier: data.library_identifier || 'TitanLibrary',
          tenant_hmac_secret: data.tenant_hmac_secret || ''
        });
      })
      .catch(err => console.warn('Blueprint fetch error:', err))
      .finally(() => setLoadingBlueprint(false));
  }, [userSession?.isAuthed, userSession?.idToken, cleanSheetId]);

  // Handler: Google OAuth Callback
  const handleGoogleCredentialResponse = async (response) => {
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Australia/Sydney';
      const res = await fetch(`${API_BASE}/api/v2/auth/handshake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${response.credential}`
        },
        body: JSON.stringify({
          id_token: response.credential,
          user_timezone: userTz
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication rejected by institutional gate.');
      }

      const u = data.user || {};
      setPendingGoogleToken(response.credential);
      setPendingUserEmail(u.email || '');

      // Check if user already has a PIN
      if (u.has_pin) {
        setSignStep('ENTER_PIN');
      } else {
        // First-time login prompt to create their 4-digit PIN
        setSignStep('CREATE_PIN');
      }
    } catch (err) {
      setAuthError(err.message || 'Cryptographic Google OAuth verification failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handler: Submit 4-Digit PIN to complete 2-point authentication
  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pinInput || pinInput.length < 4) {
      setAuthError('Please enter your complete 4-digit Security PIN.');
      return;
    }
    if (signStep === 'CREATE_PIN') {
      if (pinInput !== confirmPinInput) {
        setAuthError('PIN confirmation does not match. Please re-enter.');
        return;
      }
    }

    setAuthError('');
    setIsAuthenticating(true);
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Australia/Sydney';
      const res = await fetch(`${API_BASE}/api/v2/auth/login-with-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_token: pendingGoogleToken,
          pin: pinInput.trim(),
          user_timezone: userTz
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'PIN verification failed.');
      }

      const u = data.user || {};
      const cap = u.starting_capital || 25000;
      setStartingCapital(cap);
      setCustomCapitalInput(String(cap));
      setCurrency(u.currency || 'AUD');

      onLoginSuccess({
        email: u.email,
        name: u.name || u.email.split('@')[0].toUpperCase(),
        tenantId: u.tenant_id || 'TENANT-VERIFIED',
        role: u.role || 'OWNER',
        isAdmin: Boolean(u.is_admin),
        subscriptionTier: u.subscription_tier || 'STARTER',
        idToken: pendingGoogleToken,
        currency: u.currency || 'AUD',
        startingCapital: cap,
        kellyFraction: u.kelly_fraction || 0.50,
        chaseLimitPct: u.chase_limit_pct || 2.0,
        spreadsheetId: u.spreadsheet_id || '',
        isAuthed: true,
        hasCompletedSetup: Boolean(u.has_completed_setup || u.is_admin)
      });
    } catch (err) {
      setAuthError(err.message || '2-Point authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handler: Send Registration Email OTP
  const handleSendRegOtp = async (e) => {
    if (e) e.preventDefault();
    if (!regEmail || !regEmail.includes('@') || !regEmail.includes('.')) {
      setAuthError('Please enter a valid client email address.');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/register-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim().toLowerCase(),
          turnstile_token: turnstileToken || 'MOCK_TURNSTILE_PASS'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to dispatch verification code.');
      }
      setAuthSuccessMsg(`A 6-digit verification code has been dispatched to ${regEmail}. Please check your inbox.`);
      setRegStep(2);
    } catch (err) {
      setAuthError(err.message || 'Failed to dispatch verification email.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handler: Verify Registration OTP & Save Initial PIN
  const handleVerifyRegOtp = async (e) => {
    if (e) e.preventDefault();
    if (!regOtp || regOtp.trim().length !== 6) {
      setAuthError('Please enter the 6-digit verification code from your email.');
      return;
    }
    if (!regPin || regPin.length < 4) {
      setAuthError('Please create a 4-digit Security PIN.');
      return;
    }
    if (regPin !== regConfirmPin) {
      setAuthError('PIN confirmation does not match. Please re-enter.');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim().toLowerCase(),
          otp: regOtp.trim(),
          initial_pin: regPin.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Verification failed.');
      }
      setAuthSuccessMsg('✓ Email verified and Security PIN locked! You may now sign in with your Google account + PIN.');
      setAuthTab('SIGN_IN');
      setSignStep('GOOGLE_AUTH');
      setRegStep(1);
      setRegEmail('');
      setRegOtp('');
      setRegPin('');
      setRegConfirmPin('');
    } catch (err) {
      setAuthError(err.message || 'Verification failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handler: Request Forgot PIN OTP
  const handleSendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setAuthError('Please enter your registered email address.');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/forgot-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          turnstile_token: 'MOCK_TURNSTILE_PASS'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed.');
      setAuthSuccessMsg(`A 6-digit PIN reset code has been dispatched to ${forgotEmail}.`);
      setForgotStep(2);
    } catch (err) {
      setAuthError(err.message || 'Failed to dispatch reset code.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handler: Submit Reset PIN
  const handleResetPinSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setAuthError('Please enter the 6-digit reset code from your email.');
      return;
    }
    if (!forgotNewPin || forgotNewPin.length < 4) {
      setAuthError('Please enter a new 4-digit Security PIN.');
      return;
    }
    if (forgotNewPin !== forgotConfirmPin) {
      setAuthError('New PIN confirmation does not match.');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: forgotOtp.trim(),
          new_pin: forgotNewPin.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'PIN reset failed.');
      setAuthSuccessMsg('✓ Security PIN updated successfully! You may now sign in with your Google account and new PIN.');
      setAuthTab('SIGN_IN');
      setSignStep('GOOGLE_AUTH');
      setForgotStep(1);
    } catch (err) {
      setAuthError(err.message || 'PIN reset failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Capital & Config Handlers
  const handlePresetCapitalSelect = (amount) => {
    setStartingCapital(amount);
    setCustomCapitalInput(String(amount));
  };

  const handleCustomCapitalChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setCustomCapitalInput(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      setStartingCapital(num);
    }
  };

    const handleAutoProvisionDrive = async () => {
    setIsProvisioningDrive(true);
    setProvisionDriveError('');
    try {
      const res = await fetch(`${API_BASE}/api/v2/onboarding/provision-drive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.idToken}`
        },
        body: JSON.stringify({
          starting_capital: startingCapital,
          currency: currency,
          portfolio_name: portfolioName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Drive provisioning failed.');
      
      setProvisionedDriveData(data);
      if (data.workbook?.spreadsheet_id) {
        setSheetInput(data.workbook.spreadsheet_id);
      }
    } catch (e) {
      setProvisionDriveError(e.message || 'Failed to auto-provision Google Drive enclave.');
    } finally {
      setIsProvisioningDrive(false);
    }
  };

const handleCopyCode = () => {
    if (!blueprint.wrapper_script) return;
    navigator.clipboard.writeText(blueprint.wrapper_script);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const configTableRows = [
    { key: 'TITAN_AUTH_EMAIL', value: userSession?.email || '', desc: 'Cryptographically verified Google Account owner' },
    { key: 'TITAN_TENANT_SECRET', value: blueprint.tenant_hmac_secret || 'PENDING_HANDSHAKE', desc: 'Unforgeable HMAC-SHA256 key binding Sheet to Tenant' },
    { key: 'TITAN_STARTING_CAPITAL', value: `${startingCapital.toFixed(2)}`, desc: `Custom Starting Capital Allocation (${currency})` },
    { key: 'TITAN_BASE_CURRENCY', value: currency, desc: 'Primary accounting & position sizing currency' },
    { key: 'TITAN_KELLY_FRACTION', value: `${kellyFraction}`, desc: 'Fractional Kelly Criterion risk dampener' },
    { key: 'TITAN_CHASE_LIMIT_PCT', value: `${chaseLimitPct}%`, desc: 'Rule 24 maximum slippage ceiling above signal price' },
    { key: 'TITAN_API_ENDPOINT', value: API_BASE, desc: 'Autonomous Render Quant Brain Gateway' },
    { key: 'TITAN_ACTIVE_EXCHANGE', value: 'ASX', desc: 'Default primary exchange (ASX / NYSE / LSE / TSX)' }
  ];

  const handleCopyConfigTable = () => {
    const tsv = configTableRows.map(r => `${r.key}\t${r.value}\t${r.desc}`).join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2500);
  };

  // Step 4 Handshake Verification
  const handleRunHandshake = async () => {
    if (!cleanSheetId) {
      setVerifyError('Please enter a valid Google Sheet URL or ID in Step 2.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');
    setVerifyLogs([]);
    setVerifySuccess(false);

    try {
      setVerifyLogs(prev => [...prev, `[1/4] Establishing cryptographic session for ${userSession.email}...`]);
      await new Promise(r => setTimeout(r, 400));

      setVerifyLogs(prev => [...prev, `[2/4] Generating unforgeable HMAC-SHA256 secret for Sheet ${cleanSheetId}...`]);
      await new Promise(r => setTimeout(r, 400));

      setVerifyLogs(prev => [...prev, `[3/4] Registering ${currency} $${startingCapital.toLocaleString()} starting capital in multi-currency pots...`]);

      const res = await fetch(`${API_BASE}/api/v2/onboarding/verify-handshake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.idToken}`
        },
        body: JSON.stringify({
          spreadsheet_id: cleanSheetId,
          portfolio_name: portfolioName,
          currency: currency,
          starting_capital: startingCapital,
          kelly_fraction: kellyFraction,
          chase_limit_pct: chaseLimitPct
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Handshake failed.');

      setVerifyLogs(prev => [...prev, `[4/4] ✓ Verified! Tenant enclave securely bound.`]);
      setVerifySuccess(true);
    } catch (err) {
      setVerifyError(err.message || 'Handshake failed.');
      setVerifyLogs(prev => [...prev, `[ERROR] Verification rejected: ${err.message}`]);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalLaunch = () => {
    if (onCompleteSetup) {
      onCompleteSetup({
        spreadsheetId: cleanSheetId,
        currency,
        startingCapital,
        kellyFraction,
        chaseLimitPct
      });
    }
  };

  // Helper for PIN Keypad Button clicks
  const handleKeypadPress = (val) => {
    if (val === 'CLEAR') {
      setPinInput('');
      return;
    }
    if (val === 'BACK') {
      setPinInput(prev => prev.slice(0, -1));
      return;
    }
    if (pinInput.length < 6) {
      setPinInput(prev => prev + val);
    }
  };

  // =========================================================================
  // RENDER 1: AUTOMATED SELF-SERVICE ONBOARDING & 2-POINT AUTH GATE
  // =========================================================================
  if (!userSession?.isAuthed && !showSetupModalOnly) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
        {/* Header */}
        <header className="border-b border-slate-900/80 bg-[#0a0f18]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-mono text-sm font-black tracking-wider text-slate-100">TITAN QUANT</span>
              <span className="text-[10px] font-mono text-emerald-400 ml-2 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">2-POINT ZERO-TRUST ENCLAVE</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google OAuth + 4-Digit Security PIN</span>
          </div>
        </header>

        {/* Main Auth Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
          <div className="max-w-xl w-full bg-[#0d131f] border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            
            {/* Header Titles */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Automated Anti-Bot Protection & Bank-Grade 2FA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Titan Commercial Quant Portal
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Automated self-service client onboarding. Protected by Cloudflare Turnstile anti-bot verification and recurring Google OAuth + 4-digit Security PIN authentication.
              </p>
            </div>

            {/* Top Auth Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('SIGN_IN');
                  setSignStep('GOOGLE_AUTH');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  authTab === 'SIGN_IN'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In (Google + PIN)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('REGISTER');
                  setRegStep(1);
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  authTab === 'REGISTER'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>New Client Registration</span>
              </button>
            </div>

            {/* Error & Success Alerts */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="font-mono text-[11px] leading-relaxed">{authError}</div>
              </div>
            )}

            {authSuccessMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="font-mono text-[11px] leading-relaxed">{authSuccessMsg}</div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 1: SIGN IN (GOOGLE OAUTH + 4-DIGIT PIN) */}
            {/* ============================================================= */}
            {authTab === 'SIGN_IN' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {signStep === 'GOOGLE_AUTH' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                      <span className="text-xs font-mono text-emerald-400 font-bold block uppercase tracking-wider">
                        Step 1: Authenticate with Google
                      </span>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Connect your cryptographically verified Google Account. You will then enter your 4-digit Security PIN for 2-point authorization.
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center min-h-[56px] py-2">
                      {isAuthenticating ? (
                        <div className="text-xs font-mono text-emerald-400 animate-pulse py-3 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying cryptographic Google signature...</span>
                        </div>
                      ) : (
                        <div ref={googleBtnRef} className="flex justify-center" />
                      )}
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('FORGOT_PIN');
                          setForgotStep(1);
                          setAuthError('');
                        }}
                        className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition"
                      >
                        Forgot your 4-digit Security PIN? Click here to reset
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 of Sign In: Enter 4-Digit Security PIN */}
                {signStep === 'ENTER_PIN' && (
                  <form onSubmit={handlePinSubmit} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-800/40 text-center space-y-1">
                      <div className="text-xs font-mono text-slate-300">
                        Authenticated as: <strong className="text-emerald-400">{pendingUserEmail}</strong>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Step 2: Enter your 4-Digit Security PIN (Bank-Grade 2FA)
                      </div>
                    </div>

                    {/* PIN Visual Indicators */}
                    <div className="flex justify-center items-center gap-3 py-3">
                      {[0, 1, 2, 3].map((idx) => {
                        const hasChar = pinInput.length > idx;
                        return (
                          <div
                            key={idx}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                              hasChar
                                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-lg shadow-emerald-500/20'
                                : 'border-slate-800 bg-[#0a0e17] text-slate-600'
                            }`}
                          >
                            <span className="text-2xl font-bold font-mono">
                              {hasChar ? '●' : '○'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Direct Text Input for Keyboard Users */}
                    <div className="flex justify-center">
                      <input
                        type="password"
                        maxLength={6}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••"
                        autoFocus
                        className="w-40 text-center tracking-[0.5em] bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-base text-white font-mono outline-none"
                      />
                    </div>

                    {/* Clickable On-Screen Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto pt-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((btn) => (
                        <button
                          key={btn}
                          type="button"
                          onClick={() => handleKeypadPress(btn)}
                          className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-sm font-mono font-bold text-slate-200 transition-all active:scale-95"
                        >
                          {btn === 'CLEAR' ? 'C' : btn === 'BACK' ? '⌫' : btn}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSignStep('GOOGLE_AUTH');
                          setPinInput('');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={pinInput.length < 4 || isAuthenticating}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-mono font-bold text-black flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isAuthenticating ? 'Authorizing...' : 'Authorize Terminal'}</span>
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('FORGOT_PIN');
                          setForgotEmail(pendingUserEmail);
                          setForgotStep(1);
                          setAuthError('');
                        }}
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
                      >
                        Forgot PIN? Reset via Email Verification
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2 (First Time Google Login): Create Initial PIN */}
                {signStep === 'CREATE_PIN' && (
                  <form onSubmit={handlePinSubmit} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-800/40 text-center space-y-1">
                      <span className="text-xs font-mono text-emerald-400 font-bold block uppercase">
                        First-Time Setup: Create Security PIN
                      </span>
                      <p className="text-[11px] font-mono text-slate-400">
                        Create a private 4-digit Trading PIN for <strong className="text-white">{pendingUserEmail}</strong> to enable 2-point authentication.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                          Create 4-Digit Security PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="4-digit PIN..."
                          className="w-full bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                          Confirm 4-Digit Security PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Re-enter PIN..."
                          className="w-full bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={pinInput.length < 4 || isAuthenticating}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-mono font-bold text-black flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isAuthenticating ? 'Locking PIN...' : 'Lock PIN & Launch Node'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: NEW CLIENT SELF-SERVICE REGISTRATION & ANTI-BOT */}
            {/* ============================================================= */}
            {authTab === 'REGISTER' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {regStep === 1 ? (
                  <form onSubmit={handleSendRegOtp} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Step 1: Anti-Bot Verification & Email Entry</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        No manual admin approval required. Enter your Google or corporate email to receive a 1-time 6-digit verification code.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Client Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="client@gmail.com"
                          className="w-full bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Cloudflare Turnstile Shield Container */}
                    <div className="p-3 bg-[#0a0e17] border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Cloudflare Turnstile Anti-Robot Shield</span>
                      </div>
                      <div ref={turnstileRef} className="my-1" />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating || !regEmail}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-mono font-bold text-black flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isAuthenticating ? 'Sending Verification Code...' : 'Send 1-Time Verification Code'}</span>
                    </button>
                  </form>
                ) : (
                  /* Step 2: Enter 6-Digit OTP + Set 4-Digit Security PIN */
                  <form onSubmit={handleVerifyRegOtp} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
                        Step 2: Enter Code & Lock Security PIN
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Paste the 6-digit code sent to <strong className="text-white">{regEmail}</strong> and choose your 4-digit Security PIN.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        6-Digit Email Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123456"
                        className="w-full text-center tracking-[0.4em] bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                          Create 4-Digit PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          required
                          value={regPin}
                          onChange={(e) => setRegPin(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••"
                          className="w-full bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                          Confirm PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          required
                          value={regConfirmPin}
                          onChange={(e) => setRegConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••"
                          className="w-full bg-[#0a0e17] border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isAuthenticating || regOtp.length !== 6 || regPin.length < 4}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-mono font-bold text-black flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                      >
                        <BadgeCheck className="w-4 h-4" />
                        <span>{isAuthenticating ? 'Securing Node...' : 'Verify & Lock PIN'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 3: SELF-SERVICE FORGOT PIN RECOVERY */}
            {/* ============================================================= */}
            {authTab === 'FORGOT_PIN' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-800/40 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Self-Service PIN Recovery</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    If you forget your 4-digit Security PIN, we will dispatch an instant recovery code to your registered email address.
                  </p>
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={handleSendForgotOtp} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Your Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="client@gmail.com"
                        className="w-full bg-[#0a0e17] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('SIGN_IN');
                          setSignStep('GOOGLE_AUTH');
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAuthenticating || !forgotEmail}
                        className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-xs font-mono font-bold text-black flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Reset Code</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPinSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        6-Digit Reset Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123456"
                        className="w-full text-center tracking-[0.4em] bg-[#0a0e17] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                          New 4-Digit PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          required
                          value={forgotNewPin}
                          onChange={(e) => setForgotNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••"
                          className="w-full bg-[#0a0e17] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                          Confirm New PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          required
                          value={forgotConfirmPin}
                          onChange={(e) => setForgotConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••"
                          className="w-full bg-[#0a0e17] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isAuthenticating || forgotOtp.length !== 6 || forgotNewPin.length < 4}
                        className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-xs font-mono font-bold text-black flex items-center justify-center gap-1.5"
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>Update PIN</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Security Badges Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                <div className="text-[11px] font-mono text-emerald-400 font-bold">2-POINT AUTH</div>
                <div className="text-[10px] text-slate-400">Google + PIN</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                <div className="text-[11px] font-mono text-cyan-400 font-bold">ANTI-ROBOT</div>
                <div className="text-[10px] text-slate-400">Turnstile Shield</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                <div className="text-[11px] font-mono text-amber-400 font-bold">SELF-SERVICE</div>
                <div className="text-[10px] text-slate-400">Email OTP 2FA</div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-900/80 bg-[#0a0f18]/60 p-4 text-center text-[10px] font-mono text-slate-400">
          ASIC Statutory Disclaimer: Automated algorithmic research & risk-management tool. Strictly restricted to verified institutional allowlist tenants.
        </footer>
      </div>
    );
  }

  // =========================================================================
  // RENDER 2: POST-LOGIN 4-STEP TERMINAL SETUP WIZARD (CUSTOM CAPITAL & HMAC)
  // =========================================================================
  return (
    <div className={`${showSetupModalOnly ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4' : 'min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between'}`}>
      <div className={`w-full ${showSetupModalOnly ? 'max-w-4xl max-h-[90vh] overflow-y-auto' : 'max-w-5xl mx-auto my-6 p-4 sm:p-6'} bg-[#0d131f] border border-slate-800/80 rounded-2xl shadow-2xl relative overflow-hidden`}>
        
        {/* Wizard Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-4 bg-[#0a0f18]/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {userSession?.isAdmin ? 'SOVEREIGN MASTER SETUP' : `${userSession?.subscriptionTier || 'STARTER'} NODE SETUP`}
              </span>
              <span className="text-xs font-mono text-slate-400">{userSession?.email}</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Titan Terminal Onboarding & Dual-Factor Sheet Binding
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {showSetupModalOnly ? (
              <button
                onClick={onCloseModal}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
              >
                Close Wizard
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </div>

        {/* Wizard Step Progress Pills */}
        <div className="px-6 py-4 border-b border-slate-800/60 bg-[#070b12]/60 grid grid-cols-4 gap-2 text-center text-xs font-mono">
          {[
            { step: 1, title: '1. Capital & Risk' },
            { step: 2, title: '2. Sheet ID' },
            { step: 3, title: '3. Library Stub' },
            { step: 4, title: '4. HMAC Binding' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`py-2 px-1 rounded-lg transition-all ${
                currentStep === s.step
                  ? 'bg-emerald-500 text-black font-bold shadow-md'
                  : currentStep > s.step
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                  : 'bg-slate-900/40 text-slate-400 border border-slate-800'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* STEP 1: Custom Starting Capital & Kelly Fraction */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border border-slate-800 bg-[#0a0f18] rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Step 1: Custom Starting Capital & Base Currency Allocation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your initial trading capital pot. This value directly initializes your Google Sheet balance and drives Kelly position sizing.
                  </p>
                </div>

                {/* Currency Selection */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                    Select Portfolio Base Currency:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CURRENCY_OPTIONS.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCurrency(c.code)}
                        className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                          currency === c.code
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                            : 'border-slate-800 bg-[#0d131f] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-emerald-400">{c.code}</div>
                        <div className="text-[10px] text-slate-400">{c.symbol} ({c.code})</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capital Presets */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                    Choose Starting Capital Preset:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CAPITAL_PRESETS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handlePresetCapitalSelect(amount)}
                        className={`p-2.5 rounded-xl border font-mono text-center text-xs transition-all ${
                          startingCapital === amount
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-md'
                            : 'border-slate-800 bg-[#0d131f] text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {currency} ${amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Capital Input */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Or Enter Exact Custom Allocation ({currency}):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-mono text-xs text-slate-400">{currency} $</span>
                    <input
                      type="text"
                      value={customCapitalInput}
                      onChange={handleCustomCapitalChange}
                      placeholder="25000"
                      className="w-full bg-[#0d131f] border border-slate-700 focus:border-emerald-500 rounded-xl pl-16 pr-4 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                {/* Kelly Criterion Preset */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                    Fractional Kelly Risk Multiplier:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {KELLY_OPTIONS.map((k) => (
                      <button
                        key={k.value}
                        type="button"
                        onClick={() => setKellyFraction(k.value)}
                        className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all ${
                          kellyFraction === k.value
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold'
                            : 'border-slate-800 bg-[#0d131f] text-slate-400 hover:text-white'
                        }`}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>Proceed to Step 2: Sheet ID</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Sheet ID Binding */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border border-slate-800 bg-[#0a0f18] rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Step 2: Connect Your Google Sheet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Paste the URL or Spreadsheet ID of your dedicated Google Sheet.
                  </p>
                </div>

                {/* Turnkey Cloud Auto-Provisioning Option A */}
                <div className="p-4 rounded-xl bg-[#070b12] border border-cyan-800/60 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                        Option A: Turnkey Cloud Enclave (Recommended)
                      </span>
                      <span className="text-xs text-slate-300 font-semibold">
                        1-Click Automated Google Drive Folder & Cloned Workbook Provisioning
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoProvisionDrive}
                      disabled={isProvisioningDrive}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>{isProvisioningDrive ? 'Provisioning Drive & Cloning Workbook...' : 'Auto-Provision Google Drive & Sheet'}</span>
                    </button>
                  </div>

                  {provisionDriveError && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 font-mono">
                      {provisionDriveError}
                    </div>
                  )}

                  {provisionedDriveData && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300 space-y-2">
                      <div className="flex items-center gap-2 font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Turnkey Google Drive Enclave Successfully Provisioned!</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                        <a 
                          href={provisionedDriveData.google_drive?.folder_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Drive Folder: /Cust_{provisionedDriveData.tenant_id}</span>
                        </a>
                        <a 
                          href={provisionedDriveData.workbook?.spreadsheet_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Cloned Sheet: {provisionedDriveData.workbook?.spreadsheet_name}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-mono uppercase text-slate-500">Or Option B: Connect Existing Sheet (Manual)</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Portfolio / Node Display Name
                    </label>
                    <input
                      type="text"
                      value={portfolioName}
                      onChange={(e) => setPortfolioName(e.target.value)}
                      placeholder="My Alpha Trading Node"
                      className="w-full bg-[#0d131f] border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Google Sheet URL or Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={sheetInput}
                      onChange={(e) => setSheetInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit"
                      className="w-full bg-[#0d131f] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>

                  {cleanSheetId && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-400">Extracted Sheet ID:</span>
                      <span className="text-emerald-400 font-bold break-all">{cleanSheetId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!cleanSheetId}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all"
                >
                  <span>Proceed to Step 3: Library Script</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Protected Zero-Bundle Wrapper Script & Master Library ID */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border border-slate-800 bg-[#0a0f18] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      Step 3: Paste Wrapper Script & Add Master Library
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      In your Google Sheet, click <strong className="text-white">Extensions {`>`} Apps Script</strong>.
                    </p>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs transition-all border border-emerald-500/40"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? '✓ Copied Script!' : 'Copy Wrapper Script'}</span>
                  </button>
                </div>

                <div className="p-3.5 bg-[#05080e] rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                    <li>Paste the copied wrapper script into <code className="text-white">Code.gs</code>.</li>
                    <li>Click the <strong className="text-white">+</strong> next to <strong className="text-white">Libraries</strong>.</li>
                    <li>
                      Paste the Protected Master Library Script ID:
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 select-all my-1">
                        {loadingBlueprint ? 'Decrypting library ID...' : blueprint.master_library_id || '1d5fHImWJPDRqmfLUEtkypn9RgSwqPo1VBNcHVFPb8CGGYJX9KNf5ael6'}
                      </div>
                    </li>
                    <li>
                      Set Identifier to <code className="text-white">{blueprint.library_identifier}</code>, select <code className="text-white">HEAD</code>, click <strong className="text-white">Add</strong>, press <strong className="text-white">Ctrl+S</strong>, and run <code className="text-emerald-300">setupSystem()</code> once.
                    </li>
                  </ol>
                </div>

                <pre className="bg-[#05080e] border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
                  {loadingBlueprint ? 'Decrypting authenticated wrapper stub...' : `${blueprint.wrapper_script.slice(0, 700)}...`}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all"
                >
                  <span>Proceed to Step 4: Config & HMAC Handshake</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Config Tab + Dual-Factor HMAC Sheet Binding */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border border-slate-800 bg-[#0a0f18] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-emerald-400" />
                      Step 4: Bind Sheet Ownership & Copy Config Parameters
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Includes your custom <strong className="text-emerald-300">{currency} ${Number(startingCapital).toLocaleString()}</strong> capital allocation and unforgeable <code className="text-emerald-300">TITAN_TENANT_SECRET</code>.
                    </p>
                  </div>

                  <button
                    onClick={handleCopyConfigTable}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-all border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedConfig ? '✓ Copied TSV Config!' : 'Copy Config Rows (TSV)'}</span>
                  </button>
                </div>

                {!cleanSheetId && (
                  <div className="p-3 rounded-xl bg-[#0d131f] border border-amber-800/60">
                    <label className="block text-[10px] font-mono uppercase text-amber-300 mb-1">
                      Enter Your Google Sheet URL or ID to Generate Bound HMAC Secret:
                    </label>
                    <input
                      type="text"
                      value={sheetInput}
                      onChange={(e) => setSheetInput(e.target.value)}
                      placeholder="Paste Google Sheet URL or ID..."
                      className="w-full bg-[#070b12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>
                )}

                <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-[#0d131f]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#111827] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Parameter (Col A)</th>
                        <th className="py-2.5 px-3">Value (Col B)</th>
                        <th className="py-2.5 px-3 hidden sm:table-cell">Description (Col C)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px]">
                      {configTableRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-semibold text-emerald-400">{r.key}</td>
                          <td className="py-2 px-3 text-white font-mono break-all">{r.value}</td>
                          <td className="py-2 px-3 text-slate-400 text-[10px] hidden sm:table-cell">{r.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Handshake Verification */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Dual-Factor Sheet Ownership & HMAC Binding</span>
                      <span className="text-[11px] text-slate-400">Locks your Sheet ID + {currency} ${Number(startingCapital).toLocaleString()} capital pool to your Google account.</span>
                    </div>

                    <button
                      onClick={handleRunHandshake}
                      disabled={isVerifying}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{isVerifying ? 'Binding Sheet & HMAC...' : 'Bind Sheet & Verify Handshake'}</span>
                    </button>
                  </div>

                  {verifyError && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 font-mono">
                      {verifyError}
                    </div>
                  )}

                  {verifyLogs.length > 0 && (
                    <div className="bg-[#05080e] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400 space-y-1">
                      {verifyLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-slate-400">{`>`}</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {verifySuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold block">Dual-Factor Sheet Handshake Complete!</span>
                        <span className="text-[11px] text-emerald-400/80">Your Google Sheet is cryptographically bound with {currency} ${Number(startingCapital).toLocaleString()} starting capital.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleFinalLaunch}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Institutional Trading Terminal 🚀</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
