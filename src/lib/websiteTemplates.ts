/**
 * Extended Interactive Website Generator Templates
 * Self-contained HTML/CSS/JS applications with in-page event systems,
 * interactive modals, stateful forms, and zero-dependency inline fallbacks.
 */

export function generateFitnessWebsiteHtml(title: string, currentYear: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0c0d12; color: #f3f4f6; font-family: system-ui, -apple-system, sans-serif; margin: 0; }
    .neon-pulse { box-shadow: 0 0 25px rgba(234, 88, 12, 0.35); }
    .glass-card { background: rgba(24, 27, 36, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px); }
  </style>
</head>
<body class="min-h-screen flex flex-col relative pb-12">
  <!-- Interactive In-Page Toast -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform translate-y-[-130%] opacity-0 transition-all duration-300 pointer-events-none max-w-sm w-full bg-zinc-900/95 border border-orange-500/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3">
    <div class="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-black shrink-0 text-base">⚡</div>
    <div>
      <h4 id="toastTitle" class="text-sm font-bold text-white">Notice</h4>
      <p id="toastMessage" class="text-xs text-gray-300 mt-0.5 leading-relaxed">Status updated</p>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="border-b border-zinc-800 bg-[#0c0d12]/90 backdrop-blur sticky top-0 px-6 py-4 flex items-center justify-between z-40">
    <div class="flex items-center gap-2.5 font-black text-xl text-white">
      <span class="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-black font-extrabold text-sm">✦</span>
      <span class="tracking-tight">${title.toUpperCase()}</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-400">
      <a href="#classes" class="hover:text-orange-400 transition">Programs</a>
      <a href="#calculator" class="hover:text-orange-400 transition">BMI Calculator</a>
      <a href="#trainers" class="hover:text-orange-400 transition">Elite Trainers</a>
      <a href="#pricing" class="hover:text-orange-400 transition">Memberships</a>
    </div>
    <button onclick="openTrialModal()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition neon-pulse active:scale-95">
      Claim Free 3-Day Pass
    </button>
  </nav>

  <!-- Hero Header -->
  <header class="px-6 py-16 text-center max-w-4xl mx-auto flex flex-col items-center">
    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
      <span>✦ Elite Performance & Functional Strength</span>
    </div>
    <h1 class="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
      Forge Unstoppable <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400">Strength & Power</span>
    </h1>
    <p class="text-gray-300 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
      Welcome to ${title}. High-performance Olympic lifting zones, metabolic conditioning classes, recovery saunas, and 1-on-1 athletic coaching.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <button onclick="openTrialModal()" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider transition neon-pulse active:scale-95">
        ⚡ Start Free Trial
      </button>
      <a href="#calculator" class="px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95">
        Calculate BMI & Macros
      </a>
    </div>
  </header>

  <!-- Interactive Program Schedule with Category Filter -->
  <section id="classes" class="max-w-6xl mx-auto px-6 py-10 w-full">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-black text-white uppercase tracking-tight">Daily Training Programs</h2>
        <p class="text-xs text-gray-400 mt-1">Select a discipline to explore available sessions and coaches</p>
      </div>
      <div class="flex gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
        <button onclick="filterClasses('all')" class="fit-filter px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-black" data-cat="all">All</button>
        <button onclick="filterClasses('strength')" class="fit-filter px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white" data-cat="strength">Strength</button>
        <button onclick="filterClasses('hiit')" class="fit-filter px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white" data-cat="hiit">HIIT & Burn</button>
        <button onclick="filterClasses('recovery')" class="fit-filter px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white" data-cat="recovery">Mobility</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="fit-card glass-card p-6 rounded-2xl hover:border-orange-500/50 transition group" data-cat="strength">
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl">🏋️</span>
          <span class="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase">Heavy Barbell</span>
        </div>
        <h3 class="text-lg font-black text-white group-hover:text-orange-400 transition">Olympic Powerlifting</h3>
        <p class="text-xs text-gray-400 mt-2 leading-relaxed">Deadlift, squat, and bench mechanics under certified strength masters.</p>
        <div class="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <span class="text-gray-400">Duration: <strong class="text-white">60 mins</strong></span>
          <button onclick="bookClass('Olympic Powerlifting')" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition text-xs">Book Spot</button>
        </div>
      </div>

      <div class="fit-card glass-card p-6 rounded-2xl hover:border-orange-500/50 transition group" data-cat="hiit">
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl">🔥</span>
          <span class="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase">High Intensity</span>
        </div>
        <h3 class="text-lg font-black text-white group-hover:text-orange-400 transition">Metabolic Circuit Burn</h3>
        <p class="text-xs text-gray-400 mt-2 leading-relaxed">Kettlebell intervals, assault bikes, and core endurance bursts.</p>
        <div class="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <span class="text-gray-400">Duration: <strong class="text-white">45 mins</strong></span>
          <button onclick="bookClass('Metabolic Circuit Burn')" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition text-xs">Book Spot</button>
        </div>
      </div>

      <div class="fit-card glass-card p-6 rounded-2xl hover:border-orange-500/50 transition group" data-cat="recovery">
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl">🧘</span>
          <span class="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase">Flexibility</span>
        </div>
        <h3 class="text-lg font-black text-white group-hover:text-orange-400 transition">Dynamic Mobility & Flow</h3>
        <p class="text-xs text-gray-400 mt-2 leading-relaxed">Joint decompression, fascia release, and contrast hydrotherapy integration.</p>
        <div class="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <span class="text-gray-400">Duration: <strong class="text-white">50 mins</strong></span>
          <button onclick="bookClass('Dynamic Mobility & Flow')" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition text-xs">Book Spot</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive BMI & Calorie Intake Calculator -->
  <section id="calculator" class="max-w-4xl mx-auto px-6 py-12 w-full">
    <div class="glass-card p-8 rounded-3xl border border-zinc-800">
      <div class="text-center max-w-xl mx-auto mb-8">
        <h2 class="text-2xl font-black text-white uppercase tracking-tight">Interactive Fitness Calculator</h2>
        <p class="text-xs text-gray-400 mt-1">Compute your exact Body Mass Index (BMI) and daily metabolic maintenance calories instantly.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label class="block text-xs font-bold text-gray-300 mb-1.5 uppercase">Weight (kg)</label>
          <input id="calcWeight" type="number" value="75" min="30" max="250" class="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-sm focus:border-orange-500 outline-none" />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-300 mb-1.5 uppercase">Height (cm)</label>
          <input id="calcHeight" type="number" value="180" min="100" max="240" class="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-sm focus:border-orange-500 outline-none" />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-300 mb-1.5 uppercase">Activity Level</label>
          <select id="calcActivity" class="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-sm focus:border-orange-500 outline-none">
            <option value="1.2">Sedentary (desk job)</option>
            <option value="1.55" selected>Moderate (3-5 workouts/wk)</option>
            <option value="1.9">Intense Athlete (6-7 days)</option>
          </select>
        </div>
      </div>
      <button onclick="computeBmi()" class="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 text-black font-black text-xs uppercase tracking-wider transition active:scale-98">
        Calculate Fitness Metrics
      </button>

      <div id="calcResults" class="mt-6 p-4 rounded-2xl bg-zinc-900/90 border border-orange-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
        <div>
          <div class="text-xs text-gray-400 uppercase font-semibold">Your BMI Score</div>
          <div id="bmiDisplay" class="text-2xl font-black text-orange-400 mt-1">23.1 (Normal Weight)</div>
        </div>
        <div>
          <div class="text-xs text-gray-400 uppercase font-semibold">Daily Maintenance Target</div>
          <div id="calorieDisplay" class="text-2xl font-black text-amber-400 mt-1">2,480 kcal / day</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Trial Booking Modal -->
  <div id="trialModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-orange-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-black text-white flex items-center gap-2">
          <span>⚡</span> Claim Free 3-Day Pass
        </h3>
        <button onclick="closeTrialModal()" class="text-gray-400 hover:text-white font-bold text-lg">✕</button>
      </div>
      <form onsubmit="handleTrialSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
          <input required id="trialName" type="text" placeholder="e.g. Jordan Smith" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Phone or Email</label>
          <input required id="trialContact" type="text" placeholder="e.g. jordan@athlete.com" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Primary Fitness Goal</label>
          <select id="trialGoal" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500">
            <option value="Hypertrophy">Muscle Hypertrophy & Bulk</option>
            <option value="FatLoss">Metabolic Fat Loss & Conditioning</option>
            <option value="Endurance">Stamina & Marathon Preparation</option>
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeTrialModal()" class="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold">Cancel</button>
          <button type="submit" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-extrabold shadow-lg shadow-orange-500/30">Activate Pass</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="mt-auto border-t border-zinc-900 py-6 text-center text-xs text-gray-500">
    © ${currentYear} ${title} • Built with PREMIERS AI Interactive Platform
  </footer>

  <script>
    function showToast(title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('translate-y-[-130%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-130%]', 'opacity-0');
      }, 3500);
    }

    function openTrialModal() {
      document.getElementById('trialModal').classList.remove('hidden');
    }
    function closeTrialModal() {
      document.getElementById('trialModal').classList.add('hidden');
    }
    function handleTrialSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('trialName').value;
      const contact = document.getElementById('trialContact').value;
      closeTrialModal();
      showToast('3-Day Pass Issued!', 'Welcome ' + name + '! Your VIP gym barcode has been dispatched to ' + contact + '.');
    }

    function bookClass(name) {
      showToast('Class Reserved', 'You have been added to the attendee roster for ' + name + '!');
    }

    function filterClasses(cat) {
      document.querySelectorAll('.fit-filter').forEach(btn => {
        if (btn.dataset.cat === cat) {
          btn.className = 'fit-filter px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-black';
        } else {
          btn.className = 'fit-filter px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white';
        }
      });
      document.querySelectorAll('.fit-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'block' : 'none';
      });
    }

    function computeBmi() {
      const w = parseFloat(document.getElementById('calcWeight').value) || 75;
      const h = parseFloat(document.getElementById('calcHeight').value) || 180;
      const act = parseFloat(document.getElementById('calcActivity').value) || 1.55;
      const hMeters = h / 100;
      const bmi = (w / (hMeters * hMeters)).toFixed(1);
      let cat = 'Normal Weight';
      if (bmi < 18.5) cat = 'Underweight';
      else if (bmi >= 25 && bmi < 29.9) cat = 'Overweight';
      else if (bmi >= 30) cat = 'Obese';

      const bmr = 10 * w + 6.25 * h - 5 * 25 + 5;
      const tdee = Math.round(bmr * act);

      document.getElementById('bmiDisplay').textContent = bmi + ' (' + cat + ')';
      document.getElementById('calorieDisplay').textContent = tdee.toLocaleString() + ' kcal / day';
      showToast('Metrics Updated', 'BMI: ' + bmi + ' • Daily target: ' + tdee.toLocaleString() + ' kcal.');
    }
  </script>
</body>
</html>`;
}

export function generateMedicalWebsiteHtml(title: string, currentYear: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #080e1a; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; margin: 0; }
    .teal-glow { box-shadow: 0 0 25px rgba(20, 184, 166, 0.3); }
    .med-card { background: #0e172a; border: 1px solid #1e293b; }
  </style>
</head>
<body class="min-h-screen flex flex-col relative pb-12">
  <!-- Toast -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform translate-y-[-130%] opacity-0 transition-all duration-300 pointer-events-none max-w-sm w-full bg-slate-900 border border-teal-500/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3">
    <div class="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black shrink-0 text-base">🏥</div>
    <div>
      <h4 id="toastTitle" class="text-sm font-bold text-white">Clinic Notice</h4>
      <p id="toastMessage" class="text-xs text-slate-300 mt-0.5 leading-relaxed">Status updated</p>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="border-b border-slate-800 bg-[#080e1a]/90 backdrop-blur sticky top-0 px-6 py-4 flex items-center justify-between z-40">
    <div class="flex items-center gap-2.5 font-bold text-lg text-white">
      <span class="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-sm">✚</span>
      <span>${title}</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
      <a href="#specialties" class="hover:text-teal-400 transition">Specialties</a>
      <a href="#doctors" class="hover:text-teal-400 transition">Physicians</a>
      <a href="#emergency" class="hover:text-teal-400 transition">Urgent Hotline</a>
    </div>
    <button onclick="openApptModal()" class="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition teal-glow active:scale-95">
      Schedule Appointment
    </button>
  </nav>

  <!-- Hero -->
  <header class="px-6 py-16 text-center max-w-4xl mx-auto flex flex-col items-center">
    <div class="px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-6">
      Board-Certified Healthcare & Multispecialty Care
    </div>
    <h1 class="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
      Compassionate Medicine, <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Advanced Precision</span>
    </h1>
    <p class="text-slate-300 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
      Welcome to ${title}. Offering comprehensive diagnostics, telemedicine consultations, state-of-the-art surgical suites, and preventative health screenings.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <button onclick="openApptModal()" class="px-7 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition teal-glow active:scale-95">
        Book Doctor Online
      </button>
      <button onclick="callHotline()" class="px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs transition active:scale-95">
        🚨 24/7 Urgent Care: +1 (800) 555-NOVA
      </button>
    </div>
  </header>

  <!-- Specialties Grid -->
  <section id="specialties" class="max-w-5xl mx-auto px-6 py-10 w-full">
    <h2 class="text-2xl font-bold text-white mb-6">Medical Specialties</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="med-card p-6 rounded-2xl hover:border-teal-500/40 transition">
        <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl mb-4">❤️</div>
        <h3 class="text-lg font-bold text-white mb-1">Cardiovascular Health</h3>
        <p class="text-xs text-slate-400 leading-relaxed mb-4">Advanced echocardiograms, cardiac rehab, and preventive lipid optimization.</p>
        <button onclick="openApptModal('Cardiology')" class="text-xs font-bold text-teal-400 hover:underline">Select Specialty →</button>
      </div>
      <div class="med-card p-6 rounded-2xl hover:border-teal-500/40 transition">
        <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl mb-4">🧠</div>
        <h3 class="text-lg font-bold text-white mb-1">Neurology & Cognitive</h3>
        <p class="text-xs text-slate-400 leading-relaxed mb-4">Neuroimaging, stroke recovery programs, and specialized headache clinics.</p>
        <button onclick="openApptModal('Neurology')" class="text-xs font-bold text-teal-400 hover:underline">Select Specialty →</button>
      </div>
      <div class="med-card p-6 rounded-2xl hover:border-teal-500/40 transition">
        <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl mb-4">🦷</div>
        <h3 class="text-lg font-bold text-white mb-1">Dental & Maxillofacial</h3>
        <p class="text-xs text-slate-400 leading-relaxed mb-4">Painless orthodontic aligners, oral reconstruction, and cosmetic whitening.</p>
        <button onclick="openApptModal('Dental')" class="text-xs font-bold text-teal-400 hover:underline">Select Specialty →</button>
      </div>
    </div>
  </section>

  <!-- Appointment Modal -->
  <div id="apptModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-teal-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <span>✚</span> Schedule Consultation
        </h3>
        <button onclick="closeApptModal()" class="text-slate-400 hover:text-white font-bold text-lg">✕</button>
      </div>
      <form onsubmit="handleApptSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Patient Full Name</label>
          <input required id="patName" type="text" placeholder="e.g. Maria Chen" class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Select Department</label>
          <select id="patDept" class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500">
            <option value="Cardiology">Cardiology & Heart Care</option>
            <option value="Neurology">Neurology & Diagnostics</option>
            <option value="Dental">Dental & Oral Health</option>
            <option value="General">General Practice / Annual Physical</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Preferred Date</label>
          <input required id="patDate" type="date" value="2026-09-20" class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500" />
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeApptModal()" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">Cancel</button>
          <button type="submit" class="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20">Confirm Booking</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500">
    © ${currentYear} ${title} • Built with PREMIERS AI Interactive Platform
  </footer>

  <script>
    function showToast(title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('translate-y-[-130%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-130%]', 'opacity-0');
      }, 3500);
    }
    function openApptModal(dept) {
      if (dept) document.getElementById('patDept').value = dept;
      document.getElementById('apptModal').classList.remove('hidden');
    }
    function closeApptModal() {
      document.getElementById('apptModal').classList.add('hidden');
    }
    function handleApptSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('patName').value;
      const dept = document.getElementById('patDept').value;
      const date = document.getElementById('patDate').value;
      closeApptModal();
      showToast('Appointment Confirmed', 'Dr. consultation booked for ' + name + ' in ' + dept + ' on ' + date + '.');
    }
    function callHotline() {
      showToast('Hotline Connected', 'Transferring to 24/7 on-call triage doctor...');
    }
  </script>
</body>
</html>`;
}

export function generateCryptoWebsiteHtml(title: string, currentYear: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #060810; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; margin: 0; }
    .cyan-glow { box-shadow: 0 0 25px rgba(6, 182, 212, 0.28); }
    .web3-card { background: #0d1222; border: 1px solid #1e2942; }
  </style>
</head>
<body class="min-h-screen flex flex-col relative pb-12">
  <!-- Toast -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform translate-y-[-130%] opacity-0 transition-all duration-300 pointer-events-none max-w-sm w-full bg-[#0d1222] border border-cyan-500/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3">
    <div class="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black shrink-0 text-base">⛓️</div>
    <div>
      <h4 id="toastTitle" class="text-sm font-bold text-white">Web3 Event</h4>
      <p id="toastMessage" class="text-xs text-slate-300 mt-0.5 leading-relaxed">Status updated</p>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="border-b border-slate-800 bg-[#060810]/90 backdrop-blur sticky top-0 px-6 py-4 flex items-center justify-between z-40">
    <div class="flex items-center gap-2.5 font-black text-xl text-white">
      <span class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold text-sm">✦</span>
      <span class="tracking-tight">${title}</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
      <a href="#swap" class="hover:text-cyan-400 transition">Instant Swap</a>
      <a href="#vaults" class="hover:text-cyan-400 transition">Yield Vaults</a>
      <a href="#bridge" class="hover:text-cyan-400 transition">Cross-Chain</a>
    </div>
    <button id="walletBtn" onclick="connectWallet()" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition cyan-glow active:scale-95">
      Connect Wallet
    </button>
  </nav>

  <!-- Hero -->
  <header class="px-6 py-16 text-center max-w-4xl mx-auto flex flex-col items-center">
    <div class="px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
      Decentralized Autonomous Liquidity Matrix
    </div>
    <h1 class="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
      Decentralized Financial <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">Intelligence</span>
    </h1>
    <p class="text-slate-300 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
      ${title} provides zero-slippage AMM swaps, automated compounding yield strategies, and cryptographic zero-knowledge security on every transaction.
    </p>
  </header>

  <!-- Interactive Token Swap Calculator -->
  <section id="swap" class="max-w-md mx-auto px-6 py-6 w-full">
    <div class="web3-card p-6 rounded-3xl border border-cyan-500/30 shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-white flex items-center gap-2"><span>🔄</span> Instant Token Swap</h3>
        <span class="text-[11px] text-cyan-400 font-mono">Gas: ~12 Gwei</span>
      </div>
      <div class="p-3.5 rounded-2xl bg-black/40 border border-slate-800 mb-3">
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>You Pay</span>
          <span>Balance: 4.82 ETH</span>
        </div>
        <div class="flex items-center justify-between">
          <input id="swapInput" type="number" value="1.0" min="0.01" step="0.1" oninput="calculateSwap()" class="w-32 bg-transparent text-xl font-black text-white outline-none" />
          <span class="px-3 py-1 rounded-xl bg-slate-800 text-white text-xs font-bold">ETH</span>
        </div>
      </div>
      <div class="text-center my-1 text-cyan-400 font-bold">↓</div>
      <div class="p-3.5 rounded-2xl bg-black/40 border border-slate-800 mb-5">
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>You Receive (Estimated)</span>
          <span>Slippage: &lt; 0.1%</span>
        </div>
        <div class="flex items-center justify-between">
          <div id="swapOutput" class="text-xl font-black text-cyan-400">3,420.50</div>
          <span class="px-3 py-1 rounded-xl bg-slate-800 text-white text-xs font-bold">USDC</span>
        </div>
      </div>
      <button onclick="executeSwap()" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition cyan-glow active:scale-95">
        Swap Tokens
      </button>
    </div>
  </section>

  <footer class="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500">
    © ${currentYear} ${title} • Built with PREMIERS AI Interactive Platform
  </footer>

  <script>
    function showToast(title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('translate-y-[-130%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-130%]', 'opacity-0');
      }, 3500);
    }
    let isConnected = false;
    function connectWallet() {
      isConnected = !isConnected;
      const btn = document.getElementById('walletBtn');
      if (isConnected) {
        btn.textContent = '0x8F9...3B2';
        btn.className = 'px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider';
        showToast('Wallet Connected', 'Connected to Web3 provider: 0x8F92...3B2 (Arbitrum Mainnet)');
      } else {
        btn.textContent = 'Connect Wallet';
        btn.className = 'px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider transition cyan-glow';
        showToast('Wallet Disconnected', 'Session terminated safely.');
      }
    }
    function calculateSwap() {
      const val = parseFloat(document.getElementById('swapInput').value) || 0;
      const out = (val * 3420.5).toFixed(2);
      document.getElementById('swapOutput').textContent = out;
    }
    function executeSwap() {
      const val = document.getElementById('swapInput').value;
      const out = document.getElementById('swapOutput').textContent;
      showToast('Transaction Broadcasted', 'Swapped ' + val + ' ETH for ' + out + ' USDC on-chain! TxHash: 0x93e1...fa88');
    }
  </script>
</body>
</html>`;
}

export function generateRealEstateWebsiteHtml(title: string, currentYear: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0c0d10; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; margin: 0; }
    .gold-glow { box-shadow: 0 0 25px rgba(212, 175, 55, 0.25); }
    .estate-card { background: #14161c; border: 1px solid #232732; }
  </style>
</head>
<body class="min-h-screen flex flex-col relative pb-12">
  <div id="toast" class="fixed top-5 right-5 z-50 transform translate-y-[-130%] opacity-0 transition-all duration-300 pointer-events-none max-w-sm w-full bg-[#14161c] border border-amber-500/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0 text-base">🏛️</div>
    <div>
      <h4 id="toastTitle" class="text-sm font-bold text-white">Property Advisory</h4>
      <p id="toastMessage" class="text-xs text-slate-300 mt-0.5 leading-relaxed">Status updated</p>
    </div>
  </div>

  <nav class="border-b border-zinc-800 bg-[#0c0d10]/90 backdrop-blur sticky top-0 px-6 py-4 flex items-center justify-between z-40">
    <div class="flex items-center gap-2.5 font-serif font-bold text-xl text-amber-400">
      <span>🏛️</span>
      <span>${title.toUpperCase()}</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
      <a href="#properties" class="hover:text-amber-400 transition">Exclusive Listings</a>
      <a href="#calculator" class="hover:text-amber-400 transition">Mortgage Estimator</a>
    </div>
    <button onclick="openTourModal()" class="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition gold-glow active:scale-95">
      Schedule Private Viewing
    </button>
  </nav>

  <header class="px-6 py-16 text-center max-w-4xl mx-auto flex flex-col items-center">
    <div class="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
      Bespoke Architecture & Premier Residences
    </div>
    <h1 class="text-4xl sm:text-6xl font-serif text-white mb-6 leading-tight">
      Exceptional Living, <span class="text-amber-400">Unrivaled Privacy</span>
    </h1>
    <p class="text-slate-300 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
      Explore our handpicked curation of ultra-prime penthouses, waterfront sanctuaries, and architecturally iconic estates.
    </p>
  </header>

  <!-- Properties Grid -->
  <section id="properties" class="max-w-6xl mx-auto px-6 py-8 w-full">
    <h2 class="text-2xl font-serif text-white mb-6">Featured Portfolio</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="estate-card p-6 rounded-3xl hover:border-amber-400/50 transition group">
        <div class="text-3xl mb-3">🌅</div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Malibu Waterfront</span>
        <h3 class="text-lg font-serif font-bold text-white mt-1">The Solstice Glass Villa</h3>
        <p class="text-xs text-slate-400 mt-2">6 Bedrooms • 8 Baths • Private Ocean Helipad</p>
        <div class="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span class="text-base font-bold text-white">$14,500,000</span>
          <button onclick="openTourModal('The Solstice Glass Villa')" class="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold">Book Tour</button>
        </div>
      </div>
      <div class="estate-card p-6 rounded-3xl hover:border-amber-400/50 transition group">
        <div class="text-3xl mb-3">🏙️</div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Manhattan Sky Penthouse</span>
        <h3 class="text-lg font-serif font-bold text-white mt-1">Apex Horizon Tower 88</h3>
        <p class="text-xs text-slate-400 mt-2">4 Bedrooms • 360° Central Park Views • Infinity Pool</p>
        <div class="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span class="text-base font-bold text-white">$22,000,000</span>
          <button onclick="openTourModal('Apex Horizon Tower 88')" class="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold">Book Tour</button>
        </div>
      </div>
      <div class="estate-card p-6 rounded-3xl hover:border-amber-400/50 transition group">
        <div class="text-3xl mb-3">🌲</div>
        <span class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Aspen Mountain Haven</span>
        <h3 class="text-lg font-serif font-bold text-white mt-1">Cedar Ridge Chalet</h3>
        <p class="text-xs text-slate-400 mt-2">7 Bedrooms • Ski-in Ski-out • Thermal Spa</p>
        <div class="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span class="text-base font-bold text-white">$11,800,000</span>
          <button onclick="openTourModal('Cedar Ridge Chalet')" class="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold">Book Tour</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Viewing Modal -->
  <div id="tourModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-amber-400/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-serif font-bold text-white">Schedule Private Viewing</h3>
        <button onclick="closeTourModal()" class="text-slate-400 hover:text-white font-bold text-lg">✕</button>
      </div>
      <form onsubmit="handleTourSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <input required id="tourName" type="text" placeholder="e.g. Lord Sterling" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:border-amber-400 outline-none" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Interested Property</label>
          <input id="tourProp" type="text" value="The Solstice Glass Villa" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:border-amber-400 outline-none" />
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeTourModal()" class="flex-1 py-2.5 rounded-xl bg-zinc-800 text-white text-xs font-bold">Cancel</button>
          <button type="submit" class="flex-1 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold">Confirm Appointment</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="mt-auto border-t border-zinc-900 py-6 text-center text-xs text-slate-500">
    © ${currentYear} ${title} • Built with PREMIERS AI Interactive Platform
  </footer>

  <script>
    function showToast(title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('translate-y-[-130%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-130%]', 'opacity-0');
      }, 3500);
    }
    function openTourModal(prop) {
      if (prop) document.getElementById('tourProp').value = prop;
      document.getElementById('tourModal').classList.remove('hidden');
    }
    function closeTourModal() {
      document.getElementById('tourModal').classList.add('hidden');
    }
    function handleTourSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('tourName').value;
      const prop = document.getElementById('tourProp').value;
      closeTourModal();
      showToast('Private Tour Reserved', 'Our luxury estate concierge will escort ' + name + ' to ' + prop + '.');
    }
  </script>
</body>
</html>`;
}
