// assets/js/modules/cbqap.js
(function () {
  const TM_MARKERS = ["AFP","β-hCG","CA 125","CA 15.3","CA 19.9","CEA"];
  const METHODS = ["CLIA","ECLIA","CMIA","ELISA","Nephelometry","Turbidimetry","Other"];
  const SPE_SUBDIVISIONS = ["SPE","Immunoglobulin Quantification","Free Light Chain Quantification"];
  const IFE_SUBDIVISIONS = ["IFE"];

  const yearOpts = (n=6) => {
    const y = new Date().getFullYear();
    return Array.from({length:n},(_,i)=>`${y-i}`);
  };

  const methodOptionsHtml = (sel="") => METHODS.map(m=>`<option value="${m}" ${sel===m?"selected":""}>${m}</option>`).join("");
  const yearOptionsHtml = (sel="") => yearOpts().map(y=>`<option value="${y}" ${sel===y?"selected":""}>${y}</option>`).join("");

  const tmMarkersHtml = (idx, selected=[]) => `
    <div class="bucket-grid small">
      ${TM_MARKERS.map(m=>`
        <label class="checkcard">
          <input type="checkbox" name="tm-markers-${idx}" value="${m}" ${selected.includes(m)?"checked":""}>
          <span>${m}</span>
        </label>
      `).join("")}
    </div>`;

  function tmSetHtml(idx, preset={}) {
    const { year="", machine="", method="", methodOther="", markers=[] } = preset;
    return `
      <div class="subcard tm-set" data-tm-index="${idx}">
        <div class="row-3">
          <div class="mini-field">
            <label>Year<span class="req">*</span></label>
            <select name="tm-year-${idx}" required>
              <option value="" disabled ${!year?"selected":""}>Select year</option>
              ${yearOptionsHtml(year)}
            </select>
          </div>
          <div class="mini-field">
            <label>Machine<span class="req">*</span></label>
            <input type="text" name="tm-machine-${idx}" value="${machine}" required placeholder="e.g., Beckman Coulter DxI">
          </div>
          <div class="mini-field">
            <label>Method<span class="req">*</span></label>
            <select name="tm-method-${idx}" class="tm-method" data-idx="${idx}" required>
              <option value="" disabled ${!method?"selected":""}>Select method</option>
              ${methodOptionsHtml(method)}
            </select>
          </div>
        </div>

        <div class="row-3 tm-other ${method==="Other"?"":"hidden"}" data-other="${idx}">
          <div class="mini-field" style="grid-column:1/-1">
            <label>Specify other method<span class="req">*</span></label>
            <input type="text" name="tm-methodOther-${idx}" value="${method==="Other"?(methodOther||""):""}" ${method==="Other"?"":"disabled"} placeholder="Type method name">
          </div>
        </div>

        <div class="mini-field">
          <label>Markers</label>
          ${tmMarkersHtml(idx, markers)}
        </div>

        <div class="subactions">
          <button type="button" class="btn" data-action="selectAllMarkers" data-idx="${idx}">Select all</button>
          <button type="button" class="btn" data-action="clearMarkers" data-idx="${idx}">Clear</button>
          <span class="flex-grow"></span>
          <button type="button" class="btn" data-action="removeTm" data-idx="${idx}">Remove</button>
        </div>
      </div>`;
  }

  function elecRowHtml(group, sub, idx, preset={}) {
    const { year="", machine="", method="", methodOther="" } = preset;
    return `
      <div class="subrow" data-group="${group}" data-sub="${sub}" data-idx="${idx}">
        <div class="row-4">
          <div class="mini-field">
            <label>Year<span class="req">*</span></label>
            <select name="${group}-${sub}-year-${idx}" required>
              <option value="" disabled ${!year?"selected":""}>Select year</option>
              ${yearOptionsHtml(year)}
            </select>
          </div>

          <div class="mini-field">
            <label>Machine<span class="req">*</span></label>
            <input type="text" name="${group}-${sub}-machine-${idx}" value="${machine}" required placeholder="e.g., Sebia / Helena...">
          </div>

          <div class="mini-field">
            <label>Method<span class="req">*</span></label>
            <select name="${group}-${sub}-method-${idx}" class="elec-method" data-group="${group}" data-sub="${sub}" data-idx="${idx}" required>
              <option value="" disabled ${!method?"selected":""}>Select method</option>
              ${methodOptionsHtml(method)}
            </select>
          </div>

          <div class="mini-field" style="display:flex;align-items:flex-end;">
            <button type="button" class="btn" data-action="removeElecRow" data-group="${group}" data-sub="${sub}" data-idx="${idx}">Remove</button>
          </div>
        </div>

        <div class="row-3 elec-other ${method==="Other"?"":"hidden"}" data-group="${group}" data-sub="${sub}" data-idx="${idx}">
          <div class="mini-field" style="grid-column:1/-1">
            <label>Specify other method<span class="req">*</span></label>
            <input type="text" name="${group}-${sub}-methodOther-${idx}" value="${method==="Other"?(methodOther||""):""} ${method==="Other"?"":"disabled"} placeholder="Type method name">
          </div>
        </div>
      </div>`;
  }

  function cssSafe(s){ return String(s).replace(/\s+/g,"_").replace(/[^\w-]/g,""); }

  function mount(container) {
    container.innerHTML = `
      <!-- Tumor Markers -->
      <div class="subcard">
        <h4 class="bucket-title">Tumor Marker Module</h4>
        <p class="muted small">Add Machine/Method sets and choose markers for each set.</p>
        <div id="tm-sets"></div>
        <div class="subactions" style="margin-top:10px;">
          <button type="button" class="btn" id="addTmSet">+ Add new machine & method</button>
        </div>
      </div>

      <!-- Electrophoresis -->
      <div class="subcard" style="margin-top:14px;">
        <h4 class="bucket-title">Electrophoresis Module</h4>

        <div class="subcard" style="margin-top:8px;">
          <h5 class="bucket-title">SPE Submodule</h5>
          ${SPE_SUBDIVISIONS.map(sub=>`
            <div class="elec-group" data-group="SPE" data-sub="${sub}">
              <h5 class="muted" style="margin:6px 0 10px">${sub}</h5>
              <div class="elec-rows" id="rows-SPE-${cssSafe(sub)}"></div>
              <div class="subactions">
                <button type="button" class="btn add-elec-row" data-group="SPE" data-sub="${sub}">+ Add new ${sub} machine</button>
              </div>
              <hr class="soft">
            </div>
          `).join("")}
        </div>

        <div class="subcard" style="margin-top:8px;">
          <h5 class="bucket-title">IFE Submodule</h5>
          ${IFE_SUBDIVISIONS.map(sub=>`
            <div class="elec-group" data-group="IFE" data-sub="${sub}">
              <h5 class="muted" style="margin:6px 0 10px">${sub}</h5>
              <div class="elec-rows" id="rows-IFE-${cssSafe(sub)}"></div>
              <div class="subactions">
                <button type="button" class="btn add-elec-row" data-group="IFE" data-sub="${sub}">+ Add new machine ${sub}</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const form = container.closest('form');
    const tmSetsEl = container.querySelector('#tm-sets');

    let tmCounter = 0;
    const nextIdx = () => ++tmCounter;

    function wireTmSet(idx){
      const setEl   = container.querySelector(`.tm-set[data-tm-index="${idx}"]`);
      const method  = setEl.querySelector(`select[name="tm-method-${idx}"]`);
      const otherRow= setEl.querySelector(`.tm-other`);
      const otherIn = setEl.querySelector(`input[name="tm-methodOther-${idx}"]`);

      function toggle(){
        const show = method.value === "Other";
        otherRow.classList.toggle('hidden', !show);
        otherIn.disabled = !show;
        otherIn.required = show;
        if (!show) otherIn.value = "";
      }
      method.addEventListener('change', toggle);
      toggle();

      setEl.querySelector('[data-action="selectAllMarkers"]')
        ?.addEventListener('click', () => setEl.querySelectorAll(`input[name="tm-markers-${idx}"]`).forEach(cb => cb.checked = true));
      setEl.querySelector('[data-action="clearMarkers"]')
        ?.addEventListener('click', () => setEl.querySelectorAll(`input[name="tm-markers-${idx}"]`).forEach(cb => cb.checked = false));
      setEl.querySelector('[data-action="removeTm"]')
        ?.addEventListener('click', () => setEl.remove());
    }

    function addTmSet(preset={}){
      const idx = nextIdx();
      tmSetsEl.insertAdjacentHTML('beforeend', tmSetHtml(idx, preset));
      wireTmSet(idx);
    }

    container.querySelector('#addTmSet').addEventListener('click', () => addTmSet());
    addTmSet(); // start with one set

    function addElecRow(group, sub, preset={}){
      const box = container.querySelector(`#rows-${group}-${cssSafe(sub)}`);
      const idx = (box.childElementCount || 0) + 1;
      box.insertAdjacentHTML('beforeend', elecRowHtml(group, sub, idx, preset));

      const row = box.querySelector(`.subrow[data-group="${group}"][data-sub="${sub}"][data-idx="${idx}"]`);
      row.querySelector('[data-action="removeElecRow"]').addEventListener('click', () => row.remove());

      const methodEl = row.querySelector(`select[name="${group}-${sub}-method-${idx}"]`);
      const otherRow = row.querySelector('.elec-other');
      const otherInp = row.querySelector(`input[name="${group}-${sub}-methodOther-${idx}"]`);
      const toggle = () => {
        const show = methodEl.value === "Other";
        otherRow.classList.toggle('hidden', !show);
        otherInp.disabled = !show;
        otherInp.required = show;
        if (!show) otherInp.value = "";
      };
      methodEl.addEventListener('change', toggle);
      toggle();
    }

    // seed minimum rows
    SPE_SUBDIVISIONS.forEach(sub => addElecRow('SPE', sub));
    IFE_SUBDIVISIONS.forEach(sub => addElecRow('IFE', sub));

    container.querySelectorAll('.add-elec-row').forEach(btn => {
      btn.addEventListener('click', () => addElecRow(btn.dataset.group, btn.dataset.sub));
    });

    function collectTmSets(){
      return Array.from(container.querySelectorAll('.tm-set')).map(setEl=>{
        const idx      = setEl.dataset.tmIndex;
        const year     = setEl.querySelector(`[name="tm-year-${idx}"]`)?.value || "";
        const machine  = setEl.querySelector(`[name="tm-machine-${idx}"]`)?.value || "";
        const method   = setEl.querySelector(`[name="tm-method-${idx}"]`)?.value || "";
        const methodOther = method==="Other" ? (setEl.querySelector(`[name="tm-methodOther-${idx}"]`)?.value || "") : "";
        const markers  = Array.from(setEl.querySelectorAll(`input[name="tm-markers-${idx}"]:checked`)).map(i=>i.value);
        return { year, machine, method, methodOther, markers };
      });
    }

    function collectElectrophoresis(){
      const bundle = { SPE:{ rows:[] }, IFE:{ rows:[] } };
      function collect(group, sub){
        const rows = container.querySelectorAll(`.subrow[data-group="${group}"][data-sub="${sub}"]`);
        rows.forEach(r=>{
          const idx = r.dataset.idx;
          const year    = r.querySelector(`[name="${group}-${sub}-year-${idx}"]`)?.value || "";
          const machine = r.querySelector(`[name="${group}-${sub}-machine-${idx}"]`)?.value || "";
          const method  = r.querySelector(`[name="${group}-${sub}-method-${idx}"]`)?.value || "";
          const other   = r.querySelector(`[name="${group}-${sub}-methodOther-${idx}"]`)?.value || "";
          (bundle[group].rows).push({
            subdivision: sub, year, machine, method,
            methodOther: method==="Other" ? other : ""
          });
        });
      }
      SPE_SUBDIVISIONS.forEach(sub=>collect('SPE', sub));
      IFE_SUBDIVISIONS.forEach(sub=>collect('IFE', sub));
      return bundle;
    }

    return {
      collect(){
        return {
          program: 'CBQAP',
          tmSets: collectTmSets(),
          electrophoresis: collectElectrophoresis()
        };
      },
      destroy(){ container.innerHTML = ''; }
    };
  }

  window.EnrollModules = window.EnrollModules || {};
  window.EnrollModules.CBQAP = { mount };
})();
