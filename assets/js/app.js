// assets/js/app.js
(function () {
  // Expose a registry the modules will attach to
  window.EnrollModules = window.EnrollModules || {};

  const form = document.getElementById('eqas-register');
  const enrollRadios = Array.from(document.querySelectorAll('input[name="enrollChoice"]'));
  const programsWrap = document.getElementById('programsWrap');
  const programsGrid = document.getElementById('programsGrid');
  const detailsContainer = document.getElementById('programDetailsContainer');

  // Keep a handle per mounted program -> { collect: () => data, destroy?: () => void }
  const mounted = new Map();

  function togglePrograms() {
    const choice = enrollRadios.find(r => r.checked)?.value;
    const show = choice === 'now';
    programsWrap.style.display = show ? 'block' : 'none';
    if (!show) clearAllPrograms();
  }

  function clearAllPrograms() {
    // Unmount everything
    mounted.forEach(handle => handle?.destroy?.());
    mounted.clear();
    detailsContainer.innerHTML = '';
    programsGrid.querySelectorAll('.prog-check').forEach(cb => (cb.checked = false));
  }

  function cssSafe(s) { return String(s).replace(/\s+/g, "_").replace(/[^\w-]/g, ""); }

  function ensureBlock(programKey, programLabel) {
    let block = detailsContainer.querySelector(`[data-program="${programKey}"]`);
    if (block) return block;
    const wrapper = document.createElement('div');
    wrapper.className = 'program-details';
    wrapper.dataset.program = programKey;
    wrapper.innerHTML = `
      <div class="section-title" style="margin-top:8px">${programLabel} – Enrolment Details</div>
      <div class="program-body" id="body-${cssSafe(programKey)}"></div>
    `;
    detailsContainer.appendChild(wrapper);
    return wrapper;
  }

  function mountProgram(programKey, programLabel) {
    if (mounted.has(programKey)) return; // already mounted
    const body = ensureBlock(programKey, programLabel).querySelector('.program-body');

    const mod = window.EnrollModules[programKey];
    if (!mod || typeof mod.mount !== 'function') {
      // Fallback generic UI
      body.innerHTML = `
        <div class="subcard">
          <div class="row-3">
            <div class="mini-field">
              <label>Module Name</label>
              <input placeholder="e.g., Tumor Markers / FISH / HER2">
            </div>
            <div class="mini-field">
              <label>Cycle</label>
              <select>
                <option value="">— Select —</option>
                <option>Cycle 1</option><option>Cycle 2</option>
                <option>Cycle 3</option><option>Cycle 4</option>
              </select>
            </div>
            <div class="mini-field">
              <label>Year</label>
              <input type="number" value="${new Date().getFullYear()}">
            </div>
          </div>
        </div>`;
      mounted.set(programKey, {
        collect() {
          // super basic collector for placeholder modules
          const [moduleInp, cycleSel, yearInp] = body.querySelectorAll('input,select');
          return { module: moduleInp?.value || "", cycle: cycleSel?.value || "", year: yearInp?.value || "" };
        },
        destroy(){ body.innerHTML = ''; }
      });
      return;
    }

    // Proper module
    const handle = mod.mount(body);
    mounted.set(programKey, handle);
  }

  function unmountProgram(programKey) {
    const block = detailsContainer.querySelector(`[data-program="${programKey}"]`);
    const handle = mounted.get(programKey);
    handle?.destroy?.();
    mounted.delete(programKey);
    block?.remove();
  }

  // Respond to program checkbox changes
  programsGrid.addEventListener('change', (e) => {
    const cb = e.target.closest('.prog-check');
    if (!cb) return;
    const key = cb.dataset.key;
    const label = cb.value;
    if (cb.checked) mountProgram(key, label);
    else unmountProgram(key);
  });

  // Enroll choice toggling
  enrollRadios.forEach(r => r.addEventListener('change', togglePrograms));
  togglePrograms(); // init

  // Submit: build a single JSON and download it (no backend)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const enrollNow = enrollRadios.find(r => r.checked)?.value === 'now';
    const base = Object.fromEntries(new FormData(form).entries());

    let enrollment = { enrollNow, programs: [] };
    if (enrollNow) {
      const selected = programsGrid.querySelectorAll('.prog-check:checked');
      if (!selected.length) { alert('Please select at least one program to enroll.'); return; }
      selected.forEach(cb => {
        const key = cb.dataset.key;
        const label = cb.value;
        const handle = mounted.get(key);
        const data = handle?.collect?.() || {};
        enrollment.programs.push({ programKey: key, programLabel: label, data });
      });
    }

    const payload = { registration: base, enrollment };

    console.log('📦 Mock submission payload:', payload);
    // Download as JSON
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = 'registration-enrollment.json';
    a.click();
    URL.revokeObjectURL(a.href);

    alert('Saved JSON locally (downloaded) — check the console to preview.');
    form.reset();
    clearAllPrograms();
    togglePrograms();
  });
})();
