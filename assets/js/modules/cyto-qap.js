(function(){
  function mount(container){
    container.innerHTML = `
      <div class="subcard">
        <h4 class="bucket-title">CYTO-QAP Module</h4>
        <div class="row-3">
          <div class="mini-field"><label>Module</label><input placeholder="e.g., Cytology Smears"></div>
          <div class="mini-field"><label>Cycle</label>
            <select><option value="">— Select —</option><option>Cycle 1</option><option>Cycle 2</option><option>Cycle 3</option><option>Cycle 4</option></select>
          </div>
          <div class="mini-field"><label>Year</label><input type="number" value="${new Date().getFullYear()}"></div>
        </div>
      </div>`;
    return {
      collect(){
        const [moduleInp, cycleSel, yearInp] = container.querySelectorAll('input,select');
        return { program: 'CYTOQAP', module: moduleInp.value, cycle: cycleSel.value, year: yearInp.value };
      },
      destroy(){ container.innerHTML=''; }
    };
  }
  window.EnrollModules = window.EnrollModules || {};
  window.EnrollModules.CYTOQAP = { mount };
})();
