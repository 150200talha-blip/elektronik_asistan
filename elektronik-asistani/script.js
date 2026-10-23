document.addEventListener('DOMContentLoaded', () => {

    // ╔══════════════════════════════════════╗
    // ║  1. SAYFA NAVİGASYONU (BOTTOM NAV)   ║
    // ╚══════════════════════════════════════╝
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.page).classList.add('active');
            document.querySelector('.content-area').scrollTop = 0;
        });
    });

    // ╔══════════════════════════════════════╗
    // ║  2. SUB-TAB GEÇİŞİ                   ║
    // ╚══════════════════════════════════════╝
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const parent = tab.closest('.page');
            parent.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.view).classList.add('active');
        });
    });

    // ╔══════════════════════════════════════╗
    // ║  3. DİRENÇ HESAPLAYICI               ║
    // ╚══════════════════════════════════════╝
    const band1=document.getElementById('band-1'), band2=document.getElementById('band-2'),
          band3=document.getElementById('band-3'), band4=document.getElementById('band-4');
    const vb1=document.getElementById('vis-band-1'), vb2=document.getElementById('vis-band-2'),
          vb3=document.getElementById('vis-band-3'), vb4=document.getElementById('vis-band-4');
    const revVal=document.getElementById('reverse-val'), revUnit=document.getElementById('reverse-unit'),
          tolEl=document.getElementById('result-tolerance');

    const updateBands = () => {
        vb1.style.backgroundColor=`var(--rc-${band1.options[band1.selectedIndex].dataset.color})`;
        vb2.style.backgroundColor=`var(--rc-${band2.options[band2.selectedIndex].dataset.color})`;
        vb3.style.backgroundColor=`var(--rc-${band3.options[band3.selectedIndex].dataset.color})`;
        vb4.style.backgroundColor=`var(--rc-${band4.options[band4.selectedIndex].dataset.color})`;
        const raw=(parseInt(band1.value)*10+parseInt(band2.value))*parseFloat(band3.value);
        let u=1; if(raw>=1e6)u=1e6; else if(raw>=1e3)u=1e3;
        revVal.value=parseFloat((raw/u).toFixed(2)); revUnit.value=u;
        tolEl.textContent=`Tolerans: ±${band4.value}%`;
    };
    const reverseCalc = () => {
        const v=parseFloat(revVal.value); if(isNaN(v)||v<=0)return;
        const u=parseFloat(revUnit.value); let raw=v*u;
        let exp=Math.floor(Math.log10(raw)); if(!isFinite(exp))return;
        let base=raw/Math.pow(10,exp-1), rounded=Math.round(base);
        if(rounded===100){rounded=10;exp++;}
        const d1=Math.floor(rounded/10), d2=rounded%10;
        let mult=Math.pow(10,exp-1); if(mult>0&&mult<1)mult=parseFloat(mult.toPrecision(1));
        if(d1>=0&&d1<=9)band1.value=d1; if(d2>=0&&d2<=9)band2.value=d2;
        let best=band3.options[0].value, minD=Infinity;
        Array.from(band3.options).forEach(o=>{const diff=Math.abs(parseFloat(o.value)-mult);if(diff<minD){minD=diff;best=o.value;}});
        band3.value=best;
        vb1.style.backgroundColor=`var(--rc-${band1.options[band1.selectedIndex].dataset.color})`;
        vb2.style.backgroundColor=`var(--rc-${band2.options[band2.selectedIndex].dataset.color})`;
        vb3.style.backgroundColor=`var(--rc-${band3.options[band3.selectedIndex].dataset.color})`;
    };
    [band1,band2,band3,band4].forEach(el=>el.addEventListener('change',updateBands));
    revVal.addEventListener('input',reverseCalc); revUnit.addEventListener('change',reverseCalc);
    document.getElementById('calculate-btn').addEventListener('click',updateBands);
    updateBands();

    // ╔══════════════════════════════════════╗
    // ║  4. SMD / KAPASİTÖR                  ║
    // ╚══════════════════════════════════════╝
    document.getElementById('calc-smd-btn').addEventListener('click', () => {
        const code=document.getElementById('smd-code').value.trim();
        const out=document.getElementById('smd-result-value'), panel=document.getElementById('smd-result-panel');
        const visCode=document.getElementById('cap-vis-code'); if(visCode)visCode.textContent=code||'?';
        if(code.length<3){out.textContent='En az 3 haneli kod girin!';panel.classList.add('show');return;}
        const digits=parseInt(code.substring(0,2)), mult=parseInt(code.substring(2,3));
        if(isNaN(digits)||isNaN(mult)){out.textContent='Geçersiz kod!';panel.classList.add('show');return;}
        const pF=digits*Math.pow(10,mult);
        let r; if(pF>=1e6)r=(pF/1e6).toFixed(2)+' µF'; else if(pF>=1e3)r=(pF/1e3).toFixed(1)+' nF'; else r=pF+' pF';
        out.textContent=r; panel.classList.add('show');
    });

    // ╔══════════════════════════════════════════════╗
    // ║  5. DATASHEET KÜTÜPHANESİ (Genişletilmiş)   ║
    // ╚══════════════════════════════════════════════╝
    const componentLibrary = [
        { id:'bc547', name:'BC547', type:'NPN Transistör', package:'TO-92',
          specs:[{k:'Vceo max',v:'45 V'},{k:'Ic max',v:'100 mA'},{k:'hFE (β)',v:'110–800'},{k:'Pd max',v:'500 mW'},{k:'ft',v:'300 MHz'}],
          pins:[{n:1,l:'Emitter'},{n:2,l:'Base'},{n:3,l:'Collector'}] },
        { id:'2n2222', name:'2N2222', type:'NPN Transistör', package:'TO-92 / TO-18',
          specs:[{k:'Vceo max',v:'40 V'},{k:'Ic max',v:'800 mA'},{k:'hFE (β)',v:'100–300'},{k:'Pd max',v:'625 mW'},{k:'ft',v:'250 MHz'}],
          pins:[{n:1,l:'Emitter'},{n:2,l:'Base'},{n:3,l:'Collector'}] },
        { id:'lm741', name:'LM741', type:'Op-Amp', package:'DIP-8',
          specs:[{k:'Besleme',v:'±5V ~ ±22V'},{k:'Offset Voltaj',v:'1 mV (typ)'},{k:'CMRR',v:'90 dB'},{k:'Slew Rate',v:'0.5 V/µs'},{k:'Bant Genişliği',v:'1 MHz'}],
          pins:[{n:1,l:'Offset N1'},{n:2,l:'IN−'},{n:3,l:'IN+'},{n:4,l:'V−'},{n:8,l:'NC'},{n:7,l:'V+'},{n:6,l:'OUT'},{n:5,l:'Offset N2'}] },
        { id:'ne555', name:'NE555', type:'Timer / Osilatör', package:'DIP-8',
          specs:[{k:'Besleme',v:'4.5V ~ 16V'},{k:'Çıkış Akımı',v:'200 mA (sink/source)'},{k:'Frekans max',v:'500 kHz'},{k:'Duty Cycle',v:'Ayarlanabilir'},{k:'Tetikleme',v:'< Vcc/3'}],
          pins:[{n:1,l:'GND'},{n:2,l:'TRIG'},{n:3,l:'OUT'},{n:4,l:'RESET'},{n:8,l:'VCC'},{n:7,l:'DISCH'},{n:6,l:'THRES'},{n:5,l:'CTRL'}] },
        { id:'lm317', name:'LM317', type:'Ayarlanabilir Voltaj Regülatörü', package:'TO-220',
          specs:[{k:'Vout Aralığı',v:'1.25V ~ 37V'},{k:'Iout max',v:'1.5 A'},{k:'Vin Aralığı',v:'3V ~ 40V'},{k:'Line Reg.',v:'0.01%/V'},{k:'Load Reg.',v:'0.1%'}],
          pins:[{n:1,l:'ADJ'},{n:2,l:'VOUT'},{n:3,l:'VIN'}] },
        { id:'1n4001', name:'1N4001', type:'Doğrultucu Diyot', package:'DO-41',
          specs:[{k:'Vrrm',v:'50 V'},{k:'If max',v:'1 A'},{k:'Vf (typ)',v:'1.1 V'},{k:'Ifsm',v:'30 A'},{k:'trr',v:'2 µs'}],
          pins:[{n:1,l:'Anot (+)'},{n:2,l:'Katot (−)'}] },
        { id:'1n4148', name:'1N4148', type:'Sinyal Diyodu', package:'DO-35',
          specs:[{k:'Vr max',v:'100 V'},{k:'If max',v:'300 mA'},{k:'Vf (typ)',v:'0.72 V'},{k:'trr',v:'4 ns'},{k:'Cd',v:'4 pF'}],
          pins:[{n:1,l:'Anot (+)'},{n:2,l:'Katot (−)'}] },
        { id:'74ls04', name:'74LS04', type:'Hex Inverter (NOT)', package:'DIP-14',
          specs:[{k:'Besleme',v:'4.75V ~ 5.25V'},{k:'Propagation Delay',v:'22 ns (typ)'},{k:'Fan-Out',v:'20'},{k:'Icc',v:'12 mA (typ)'}],
          pins:[{n:1,l:'1A'},{n:2,l:'1Y'},{n:3,l:'2A'},{n:4,l:'2Y'},{n:5,l:'3A'},{n:6,l:'3Y'},{n:7,l:'GND'},{n:14,l:'VCC'},{n:13,l:'6A'},{n:12,l:'6Y'},{n:11,l:'5A'},{n:10,l:'5Y'},{n:9,l:'4A'},{n:8,l:'4Y'}] },
        { id:'74ls08', name:'74LS08', type:'Quad 2-Input AND', package:'DIP-14',
          specs:[{k:'Besleme',v:'4.75V ~ 5.25V'},{k:'Propagation Delay',v:'27 ns (typ)'},{k:'Fan-Out',v:'20'},{k:'Icc',v:'16 mA (typ)'}],
          pins:[{n:1,l:'1A'},{n:2,l:'1B'},{n:3,l:'1Y'},{n:4,l:'2A'},{n:5,l:'2B'},{n:6,l:'2Y'},{n:7,l:'GND'},{n:14,l:'VCC'},{n:13,l:'4B'},{n:12,l:'4A'},{n:11,l:'4Y'},{n:10,l:'3B'},{n:9,l:'3A'},{n:8,l:'3Y'}] },
        { id:'74ls32', name:'74LS32', type:'Quad 2-Input OR', package:'DIP-14',
          specs:[{k:'Besleme',v:'4.75V ~ 5.25V'},{k:'Propagation Delay',v:'22 ns (typ)'},{k:'Fan-Out',v:'20'},{k:'Icc',v:'17 mA (typ)'}],
          pins:[{n:1,l:'1A'},{n:2,l:'1B'},{n:3,l:'1Y'},{n:4,l:'2A'},{n:5,l:'2B'},{n:6,l:'2Y'},{n:7,l:'GND'},{n:14,l:'VCC'},{n:13,l:'4B'},{n:12,l:'4A'},{n:11,l:'4Y'},{n:10,l:'3B'},{n:9,l:'3A'},{n:8,l:'3Y'}] },
        { id:'lm358', name:'LM358', type:'Dual Op-Amp', package:'DIP-8',
          specs:[{k:'Besleme',v:'3V ~ 32V (tek) / ±1.5V ~ ±16V'},{k:'Offset Voltaj',v:'2 mV (typ)'},{k:'CMRR',v:'85 dB'},{k:'Slew Rate',v:'0.3 V/µs'},{k:'Bant Genişliği',v:'1 MHz'}],
          pins:[{n:1,l:'OUT1'},{n:2,l:'IN1−'},{n:3,l:'IN1+'},{n:4,l:'GND'},{n:8,l:'VCC'},{n:7,l:'OUT2'},{n:6,l:'IN2−'},{n:5,l:'IN2+'}] },
        { id:'lm7805', name:'LM7805', type:'5V Sabit Regülatör', package:'TO-220',
          specs:[{k:'Vout',v:'5V (sabit)'},{k:'Iout max',v:'1.5 A'},{k:'Vin Aralığı',v:'7V ~ 25V'},{k:'Line Reg.',v:'3 mV (typ)'},{k:'Ripple Rejection',v:'78 dB'}],
          pins:[{n:1,l:'IN'},{n:2,l:'GND'},{n:3,l:'OUT'}] },
        { id:'l293d', name:'L293D', type:'Motor Sürücü (Dual H-Bridge)', package:'DIP-16',
          specs:[{k:'Besleme (Motor)',v:'4.5V ~ 36V'},{k:'Çıkış Akımı',v:'600 mA / kanal'},{k:'Tepe Akım',v:'1.2 A / kanal'},{k:'Lojik Gerilim',v:'5V'}],
          pins:[{n:1,l:'EN1'},{n:2,l:'IN1'},{n:3,l:'OUT1'},{n:4,l:'GND'},{n:5,l:'GND'},{n:6,l:'OUT2'},{n:7,l:'IN2'},{n:8,l:'VCC2'},{n:16,l:'VCC1'},{n:15,l:'IN4'},{n:14,l:'OUT4'},{n:13,l:'GND'},{n:12,l:'GND'},{n:11,l:'OUT3'},{n:10,l:'IN3'},{n:9,l:'EN2'}] },
        { id:'atmega328p', name:'ATmega328P', type:'8-bit AVR Mikrodenetleyici', package:'DIP-28',
          specs:[{k:'Flash',v:'32 KB'},{k:'SRAM',v:'2 KB'},{k:'EEPROM',v:'1 KB'},{k:'Fmax',v:'20 MHz'},{k:'I/O',v:'23 pin'},{k:'ADC',v:'6 kanal (10-bit)'},{k:'Besleme',v:'1.8V ~ 5.5V'}],
          pins:[{n:1,l:'PC6/RST'},{n:2,l:'PD0/RX'},{n:3,l:'PD1/TX'},{n:4,l:'PD2'},{n:5,l:'PD3'},{n:6,l:'PD4'},{n:7,l:'VCC'},{n:8,l:'GND'},{n:9,l:'PB6/XT1'},{n:10,l:'PB7/XT2'},{n:11,l:'PD5'},{n:12,l:'PD6'},{n:13,l:'PD7'},{n:14,l:'PB0'},{n:28,l:'PC5/SCL'},{n:27,l:'PC4/SDA'},{n:26,l:'PC3'},{n:25,l:'PC2'},{n:24,l:'PC1'},{n:23,l:'PC0'},{n:22,l:'GND'},{n:21,l:'AREF'},{n:20,l:'AVCC'},{n:19,l:'PB5/SCK'},{n:18,l:'PB4/MISO'},{n:17,l:'PB3/MOSI'},{n:16,l:'PB2/SS'},{n:15,l:'PB1'}] },
    ];

    const icSel = document.getElementById('ic-selector');
    componentLibrary.forEach((c,i) => { const o=document.createElement('option'); o.value=i; o.textContent=`${c.name} — ${c.type}`; icSel.appendChild(o); });

    icSel.addEventListener('change', (e) => {
        const comp = componentLibrary[e.target.value];
        document.getElementById('ds-name').textContent = comp.name;
        const body = document.getElementById('ic-body');
        body.innerHTML = '<div class="ic-notch"></div>';
        const total = comp.pins.length;
        const perSide = Math.ceil(total / 2);
        body.style.height = Math.max(70, perSide * 22 + 28) + 'px';

        const leftRow = document.createElement('div'); leftRow.className = 'ic-pin-row left';
        const rightRow = document.createElement('div'); rightRow.className = 'ic-pin-row right';

        for (let i = 0; i < perSide; i++) {
            const p = comp.pins[i]; if (!p) continue;
            leftRow.innerHTML += `<div class="ic-pin"><span class="pin-label">${p.l}</span></div>`;
        }
        for (let i = total - 1; i >= perSide; i--) {
            const p = comp.pins[i]; if (!p) continue;
            rightRow.innerHTML += `<div class="ic-pin"><span class="pin-label">${p.l}</span></div>`;
        }
        body.appendChild(leftRow); body.appendChild(rightRow);

        // Spec table + pinout
        let html = `<div style="text-align:left;margin-top:10px;"><span style="color:var(--t2);font-size:.72rem">Tür: <b style="color:var(--primary)">${comp.type}</b> &nbsp;|&nbsp; Kılıf: <b style="color:var(--t1)">${comp.package}</b></span></div>`;
        html += '<table class="ds-spec-table"><tr><th>Parametre</th><th>Değer</th></tr>';
        comp.specs.forEach(s => { html += `<tr><td>${s.k}</td><td style="color:var(--primary)">${s.v}</td></tr>`; });
        html += '</table>';
        html += '<div class="pinout-grid" style="margin-top:12px">';
        comp.pins.forEach(p => { html += `<span><b>${p.n}:</b> ${p.l}</span>`; });
        html += '</div>';
        document.getElementById('ds-desc').innerHTML = comp.name + ' — ' + comp.type + html;
    });

    // ╔══════════════════════════════════════╗
    // ║  6. OHM KANUNU                       ║
    // ╚══════════════════════════════════════╝
    document.getElementById('calc-ohm-btn').addEventListener('click', () => {
        let v=parseFloat(document.getElementById('ohm-v').value), i=parseFloat(document.getElementById('ohm-i').value),
            r=parseFloat(document.getElementById('ohm-r').value), p=parseFloat(document.getElementById('ohm-p').value);
        const filled=[!isNaN(v),!isNaN(i),!isNaN(r),!isNaN(p)].filter(Boolean).length;
        if(filled>2){['ohm-v','ohm-i','ohm-r','ohm-p'].forEach(id=>document.getElementById(id).value='');return;}
        if(filled<2)return;
        if(!isNaN(v)&&!isNaN(i)){r=v/i;p=v*i;} else if(!isNaN(v)&&!isNaN(r)){i=v/r;p=v*v/r;}
        else if(!isNaN(v)&&!isNaN(p)){i=p/v;r=v*v/p;} else if(!isNaN(i)&&!isNaN(r)){v=i*r;p=i*i*r;}
        else if(!isNaN(i)&&!isNaN(p)){v=p/i;r=p/(i*i);} else if(!isNaN(r)&&!isNaN(p)){v=Math.sqrt(p*r);i=Math.sqrt(p/r);}
        document.getElementById('ohm-v').value=isFinite(v)?v.toFixed(2):'';
        document.getElementById('ohm-i').value=isFinite(i)?i.toFixed(4):'';
        document.getElementById('ohm-r').value=isFinite(r)?r.toFixed(2):'';
        document.getElementById('ohm-p').value=isFinite(p)?p.toFixed(2):'';
    });

    // ╔══════════════════════════════════════════════╗
    // ║  7. DİNAMİK MATRİS (2x2, 3x3, 4x4 KRAMER) ║
    // ╚══════════════════════════════════════════════╝
    const matrixContainer = document.getElementById('matrix-container');
    const matrixSizeSel = document.getElementById('matrix-size');

    function buildMatrixGrid(n) {
        let html = `<div class="matrix-grid" style="grid-template-columns: ${'1fr '.repeat(n)} auto 1fr">`;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) html += `<input type="number" id="m${r}${c}" placeholder="a${r+1}${c+1}">`;
            html += `<span class="meq-sign">=</span><input type="number" id="d${r}" placeholder="b${r+1}">`;
        }
        html += '</div>';
        matrixContainer.innerHTML = html;
    }
    matrixSizeSel.addEventListener('change', () => buildMatrixGrid(parseInt(matrixSizeSel.value)));
    buildMatrixGrid(3);

    // Generic determinant (recursion)
    function det(m) {
        const n = m.length;
        if (n === 1) return m[0][0];
        if (n === 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];
        let d = 0;
        for (let j = 0; j < n; j++) {
            const sub = m.slice(1).map(row => row.filter((_,ci) => ci !== j));
            d += ((j % 2 === 0 ? 1 : -1) * m[0][j] * det(sub));
        }
        return d;
    }

    document.getElementById('calc-matrix-btn').addEventListener('click', () => {
        const n = parseInt(matrixSizeSel.value);
        const A = [], B = [];
        for (let r = 0; r < n; r++) {
            A[r] = [];
            for (let c = 0; c < n; c++) A[r][c] = parseFloat(document.getElementById(`m${r}${c}`).value) || 0;
            B[r] = parseFloat(document.getElementById(`d${r}`).value) || 0;
        }
        const dA = det(A);
        const out = document.getElementById('matrix-result-value'), panel = document.getElementById('matrix-result-panel');
        if (Math.abs(dA) < 1e-12) { out.textContent = 'Determinant ≈ 0 → Tekil matris'; panel.classList.add('show'); return; }
        const vars = ['x','y','z','w'];
        let html = `<b>det(A) = ${dA.toFixed(4)}</b><br>`;
        for (let j = 0; j < n; j++) {
            const Aj = A.map((row,ri) => row.map((v,ci) => ci === j ? B[ri] : v));
            const val = det(Aj) / dA;
            html += `${vars[j]} = ${val.toFixed(4)}<br>`;
        }
        out.innerHTML = html; panel.classList.add('show');
    });

    // ╔══════════════════════════════════════╗
    // ║  8. AC FAZÖR                         ║
    // ╚══════════════════════════════════════╝
    const phOut=document.getElementById('phasor-result-value'), phPanel=document.getElementById('phasor-result-panel');
    const drawPhasor = (r, thDeg) => {
        const c=document.getElementById('phasor-canvas'); if(!c)return;
        const ctx=c.getContext('2d'), cx=75, cy=75;
        ctx.clearRect(0,0,150,150);
        ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(150,cy); ctx.moveTo(cx,0); ctx.lineTo(cx,150); ctx.stroke();
        const rad=-thDeg*Math.PI/180, len=Math.min(r*3,55);
        ctx.strokeStyle='#00f3ff'; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(rad)*len,cy+Math.sin(rad)*len); ctx.stroke();
        ctx.fillStyle='#00f3ff'; ctx.beginPath();
        ctx.arc(cx+Math.cos(rad)*len,cy+Math.sin(rad)*len,3,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(0,243,255,0.3)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(cx,cy,20,0,-thDeg*Math.PI/180,thDeg>0); ctx.stroke();
    };
    drawPhasor(0,0);
    document.getElementById('calc-rect-to-pol-btn').addEventListener('click', () => {
        const a=parseFloat(document.getElementById('phs-a').value)||0, b=parseFloat(document.getElementById('phs-b').value)||0;
        const r=Math.sqrt(a*a+b*b), th=Math.atan2(b,a)*(180/Math.PI);
        phOut.innerHTML=`${r.toFixed(3)} ∠ ${th.toFixed(2)}°`; phPanel.classList.add('show'); drawPhasor(r,th);
    });
    document.getElementById('calc-pol-to-rect-btn').addEventListener('click', () => {
        const r=parseFloat(document.getElementById('phs-r').value)||0, th=parseFloat(document.getElementById('phs-th').value)||0;
        const rad=th*Math.PI/180, a=r*Math.cos(rad), b=r*Math.sin(rad), sign=b>=0?'+':'−';
        phOut.innerHTML=`${a.toFixed(3)} ${sign} j${Math.abs(b).toFixed(3)}`; phPanel.classList.add('show'); drawPhasor(r,th);
    });

    // ╔══════════════════════════════════════════╗
    // ║  9. BJT DC BIAS + MODEL SEÇİCİ           ║
    // ╚══════════════════════════════════════════╝
    const bjtModels = [
        { name:'BC547', beta:200, vceMax:45 },
        { name:'BC548', beta:300, vceMax:30 },
        { name:'BC557 (PNP)', beta:200, vceMax:45 },
        { name:'2N2222', beta:150, vceMax:40 },
        { name:'2N3904', beta:200, vceMax:40 },
        { name:'2N3906 (PNP)', beta:200, vceMax:40 },
        { name:'BD139', beta:80, vceMax:80 },
        { name:'TIP31', beta:50, vceMax:40 },
    ];
    const bjtModelSel = document.getElementById('bjt-model');
    bjtModels.forEach((m,i) => { const o=document.createElement('option'); o.value=i; o.textContent=`${m.name} (β≈${m.beta})`; bjtModelSel.appendChild(o); });
    bjtModelSel.addEventListener('change', () => {
        if (bjtModelSel.value === '') return;
        document.getElementById('bjt-beta').value = bjtModels[bjtModelSel.value].beta;
    });

    document.getElementById('calc-bjt-btn').addEventListener('click', () => {
        const vcc=parseFloat(document.getElementById('bjt-vcc').value), rb=parseFloat(document.getElementById('bjt-rb').value),
              rc=parseFloat(document.getElementById('bjt-rc').value), beta=parseFloat(document.getElementById('bjt-beta').value);
        const out=document.getElementById('bjt-result-value'), panel=document.getElementById('bjt-result-panel');
        if(isNaN(vcc)||isNaN(rb)||isNaN(rc)||isNaN(beta)||rb<=0){out.textContent='Tüm değerleri girin!';panel.classList.add('show');return;}
        const ib=(vcc-0.7)/rb;
        if(ib<=0){out.textContent='Kesim bölgesi — Ib ≤ 0';panel.classList.add('show');return;}
        const ic_act=beta*ib; let vce=vcc-ic_act*rc, region='Aktif Bölge', ic=ic_act;
        if(vce<=0.2){region='Doyum (Saturation)';vce=0.2;ic=(vcc-vce)/rc;}
        out.innerHTML=`<b>Bölge:</b> ${region}<br><b>Ib:</b> ${(ib*1e6).toFixed(2)} µA<br><b>Ic:</b> ${(ic*1e3).toFixed(2)} mA<br><b>Vce:</b> ${vce.toFixed(2)} V`;
        panel.classList.add('show');
    });

    // ╔══════════════════════════════════════╗
    // ║  9b. JFET (SHOCKLEY)                 ║
    // ╚══════════════════════════════════════╝
    document.getElementById('calc-jfet-btn').addEventListener('click', () => {
        const idss=parseFloat(document.getElementById('jfet-idss').value), vp=parseFloat(document.getElementById('jfet-vp').value),
              vgs=parseFloat(document.getElementById('jfet-vgs').value);
        const out=document.getElementById('jfet-result-value'), panel=document.getElementById('jfet-result-panel');
        if(isNaN(idss)||isNaN(vp)||isNaN(vgs)||vp===0){out.textContent='Tüm değerleri girin!';panel.classList.add('show');return;}
        const vpAbs=Math.abs(vp); let region, id;
        if(vgs>=0){region='Vgs ≥ 0 → Kanal tam açık';id=idss;}
        else if(Math.abs(vgs)>=vpAbs){region='Kesim (Cut-off)';id=0;}
        else{region='Aktif Bölge';id=idss*Math.pow(1-(vgs/(-vpAbs)),2);}
        out.innerHTML=`<b>Bölge:</b> ${region}<br><b>Id:</b> ${id.toFixed(3)} mA<br><b>gm₀:</b> ${(2*idss/vpAbs).toFixed(3)} mA/V`;
        panel.classList.add('show');
    });

    // ╔══════════════════════════════════════╗
    // ║  9c. MOSFET                          ║
    // ╚══════════════════════════════════════╝
    document.getElementById('calc-mosfet-btn').addEventListener('click', () => {
        const k=parseFloat(document.getElementById('mos-k').value), vth=parseFloat(document.getElementById('mos-vth').value),
              vgs=parseFloat(document.getElementById('mos-vgs').value), vds=parseFloat(document.getElementById('mos-vds').value);
        const out=document.getElementById('mosfet-result-value'), panel=document.getElementById('mosfet-result-panel');
        if(isNaN(k)||isNaN(vth)||isNaN(vgs)){out.textContent='k, Vth ve Vgs girin!';panel.classList.add('show');return;}
        const vov=vgs-vth; let region, id;
        if(vov<=0){region='Kesim (Cut-off)';id=0;}
        else if(!isNaN(vds)&&vds<vov){region='Lineer (Triode)';id=k*(2*vov*vds-vds*vds);}
        else{region='Doyum (Saturation)';id=k*vov*vov;}
        out.innerHTML=`<b>Bölge:</b> ${region}<br><b>Vov:</b> ${vov.toFixed(2)} V<br><b>Id:</b> ${id.toFixed(3)} mA`;
        panel.classList.add('show');
    });

    // ╔══════════════════════════════════════╗
    // ║  10. OP-AMP KAZANÇ                   ║
    // ╚══════════════════════════════════════╝
    document.getElementById('calc-opamp-btn').addEventListener('click', () => {
        const type=document.getElementById('opamp-type').value, r1=parseFloat(document.getElementById('opamp-r1').value),
              rf=parseFloat(document.getElementById('opamp-rf').value);
        const out=document.getElementById('opamp-result-value'), panel=document.getElementById('opamp-result-panel');
        if(isNaN(r1)||isNaN(rf)||r1<=0){out.textContent='R1 ve Rf girin!';panel.classList.add('show');return;}
        let gain;
        if(type==='inverting'){gain=-(rf/r1);out.innerHTML=`Av = −Rf/R1 = <b>${gain.toFixed(2)}</b>`;}
        else{gain=1+(rf/r1);out.innerHTML=`Av = 1+Rf/R1 = <b>${gain.toFixed(2)}</b>`;}
        panel.classList.add('show');
    });

    // ╔══════════════════════════════════════╗
    // ║  11. LOJİK KAPILAR                   ║
    // ╚══════════════════════════════════════╝
    const gateData = {
        AND:  { inputs:2, fn:(a,b)=>a&b, symbol:`<svg viewBox="0 0 160 100"><line x1="0" y1="30" x2="40" y2="30" stroke="#00f3ff" stroke-width="2"/><line x1="0" y1="70" x2="40" y2="70" stroke="#00f3ff" stroke-width="2"/><rect x="40" y="15" width="40" height="70" rx="0" fill="none" stroke="#00f3ff" stroke-width="2"/><path d="M80,15 Q110,15 110,50 Q110,85 80,85" fill="none" stroke="#00f3ff" stroke-width="2"/><line x1="110" y1="50" x2="150" y2="50" stroke="#00f3ff" stroke-width="2"/><text x="55" y="55" fill="rgba(255,255,255,.3)" font-size="14" font-family="Outfit">AND</text></svg>`},
        OR:   { inputs:2, fn:(a,b)=>a|b, symbol:`<svg viewBox="0 0 160 100"><line x1="0" y1="30" x2="45" y2="30" stroke="#00f3ff" stroke-width="2"/><line x1="0" y1="70" x2="45" y2="70" stroke="#00f3ff" stroke-width="2"/><path d="M35,15 Q55,50 35,85" fill="none" stroke="#00f3ff" stroke-width="2"/><path d="M35,15 Q90,15 115,50 Q90,85 35,85" fill="none" stroke="#00f3ff" stroke-width="2"/><line x1="115" y1="50" x2="150" y2="50" stroke="#00f3ff" stroke-width="2"/><text x="55" y="55" fill="rgba(255,255,255,.3)" font-size="14" font-family="Outfit">OR</text></svg>`},
        NOT:  { inputs:1, fn:(a)=>a^1, symbol:`<svg viewBox="0 0 160 100"><line x1="0" y1="50" x2="40" y2="50" stroke="#00f3ff" stroke-width="2"/><polygon points="40,20 40,80 110,50" fill="none" stroke="#00f3ff" stroke-width="2"/><circle cx="116" cy="50" r="6" fill="none" stroke="#00f3ff" stroke-width="2"/><line x1="122" y1="50" x2="150" y2="50" stroke="#00f3ff" stroke-width="2"/><text x="55" y="55" fill="rgba(255,255,255,.3)" font-size="12" font-family="Outfit">NOT</text></svg>`},
        NAND: { inputs:2, fn:(a,b)=>(a&b)^1, symbol:`<svg viewBox="0 0 160 100"><line x1="0" y1="30" x2="40" y2="30" stroke="#00f3ff" stroke-width="2"/><line x1="0" y1="70" x2="40" y2="70" stroke="#00f3ff" stroke-width="2"/><rect x="40" y="15" width="40" height="70" rx="0" fill="none" stroke="#00f3ff" stroke-width="2"/><path d="M80,15 Q110,15 110,50 Q110,85 80,85" fill="none" stroke="#00f3ff" stroke-width="2"/><circle cx="116" cy="50" r="6" fill="none" stroke="#00f3ff" stroke-width="2"/><line x1="122" y1="50" x2="150" y2="50" stroke="#00f3ff" stroke-width="2"/><text x="48" y="55" fill="rgba(255,255,255,.3)" font-size="11" font-family="Outfit">NAND</text></svg>`},
        NOR:  { inputs:2, fn:(a,b)=>(a|b)^1, symbol:`<svg viewBox="0 0 160 100"><line x1="0" y1="30" x2="45" y2="30" stroke="#00f3ff" stroke-width="2"/><line x1="0" y1="70" x2="45" y2="70" stroke="#00f3ff" stroke-width="2"/><path d="M35,15 Q55,50 35,85" fill="none" stroke="#00f3ff" stroke-width="2"/><path d="M35,15 Q90,15 110,50 Q90,85 35,85" fill="none" stroke="#00f3ff" stroke-width="2"/><circle cx="116" cy="50" r="6" fill="none" stroke="#00f3ff" stroke-width="2"/><line x1="122" y1="50" x2="150" y2="50" stroke="#00f3ff" stroke-width="2"/><text x="50" y="55" fill="rgba(255,255,255,.3)" font-size="12" font-family="Outfit">NOR</text></svg>`},
        XOR:  { inputs:2, fn:(a,b)=>a^b, symbol:`<svg viewBox="0 0 160 100"><line x1="0" y1="30" x2="48" y2="30" stroke="#00f3ff" stroke-width="2"/><line x1="0" y1="70" x2="48" y2="70" stroke="#00f3ff" stroke-width="2"/><path d="M30,15 Q50,50 30,85" fill="none" stroke="#00f3ff" stroke-width="2"/><path d="M38,15 Q58,50 38,85" fill="none" stroke="#00f3ff" stroke-width="2"/><path d="M38,15 Q93,15 118,50 Q93,85 38,85" fill="none" stroke="#00f3ff" stroke-width="2"/><line x1="118" y1="50" x2="150" y2="50" stroke="#00f3ff" stroke-width="2"/><text x="55" y="55" fill="rgba(255,255,255,.3)" font-size="12" font-family="Outfit">XOR</text></svg>`},
    };

    const gateSel = document.getElementById('gate-select');
    const gateSymbolEl = document.getElementById('gate-symbol');
    const truthContainer = document.getElementById('truth-table-container');

    function renderGate(name) {
        const g = gateData[name];
        gateSymbolEl.innerHTML = g.symbol;
        let html = '<table class="truth-table">';
        if (g.inputs === 1) {
            html += '<tr><th>A</th><th>Çıkış (Y)</th></tr>';
            [0,1].forEach(a => { const y=g.fn(a); html += `<tr><td>${a}</td><td class="out-${y}">${y}</td></tr>`; });
        } else {
            html += '<tr><th>A</th><th>B</th><th>Çıkış (Y)</th></tr>';
            [[0,0],[0,1],[1,0],[1,1]].forEach(([a,b]) => { const y=g.fn(a,b); html += `<tr><td>${a}</td><td>${b}</td><td class="out-${y}">${y}</td></tr>`; });
        }
        html += '</table>';
        truthContainer.innerHTML = html;
    }
    gateSel.addEventListener('change', () => renderGate(gateSel.value));
    renderGate('AND');

    // ╔══════════════════════════════════════╗
    // ║  12. ASENKRON MOTOR                  ║
    // ╚══════════════════════════════════════╝
    document.getElementById('calc-motor-btn').addEventListener('click', () => {
        const f=parseFloat(document.getElementById('motor-f').value), p=parseFloat(document.getElementById('motor-p').value),
              nr=parseFloat(document.getElementById('motor-nr').value);
        const out=document.getElementById('motor-result-value'), panel=document.getElementById('motor-result-panel');
        if(isNaN(f)||isNaN(p)||isNaN(nr)||p<=0){out.textContent='Tüm değerleri girin!';panel.classList.add('show');return;}
        const ns=(120*f)/p, slip=(ns-nr)/ns;
        out.innerHTML=`<b>Ns:</b> ${ns.toFixed(0)} RPM<br><b>Kayma (s):</b> %${(slip*100).toFixed(2)}<br><b>Nr:</b> ${nr} RPM`;
        panel.classList.add('show');
        const rotor=document.getElementById('motor-rotor');
        if(rotor)rotor.style.animation=`spin ${Math.max(0.2,2/(slip+0.05))}s linear infinite`;
        const nsL=document.getElementById('motor-ns-label'), slL=document.getElementById('motor-slip-label');
        if(nsL)nsL.textContent=`Ns = ${ns.toFixed(0)}`; if(slL)slL.textContent=`s = %${(slip*100).toFixed(1)}`;
    });

    // ╔══════════════════════════════════════╗
    // ║  13. BUCK CONVERTER                  ║
    // ╚══════════════════════════════════════╝
    document.getElementById('calc-buck-btn').addEventListener('click', () => {
        const vin=parseFloat(document.getElementById('buck-vin').value), vout=parseFloat(document.getElementById('buck-vout').value),
              f=parseFloat(document.getElementById('buck-f').value), dil=parseFloat(document.getElementById('buck-dil').value);
        const out=document.getElementById('buck-result-value'), panel=document.getElementById('buck-result-panel');
        if(isNaN(vin)||isNaN(vout)||isNaN(f)||isNaN(dil)||vin<=vout||f<=0||dil<=0){out.textContent='Değerleri kontrol edin! (Vin > Vout)';panel.classList.add('show');return;}
        const duty=vout/vin, L=(vout*(vin-vout))/(vin*f*dil);
        out.innerHTML=`<b>Duty (D):</b> %${(duty*100).toFixed(1)}<br><b>Lmin:</b> ${(L*1e6).toFixed(2)} µH`;
        panel.classList.add('show');
    });

    // ╔══════════════════════════════════════╗
    // ║  14. AWG KABLO KESİT TABLOSU         ║
    // ╚══════════════════════════════════════╝
    const awgTable = [
        { awg:0,  mm2:53.49, amp:245 },
        { awg:1,  mm2:42.41, amp:211 },
        { awg:2,  mm2:33.63, amp:181 },
        { awg:4,  mm2:21.15, amp:135 },
        { awg:6,  mm2:13.30, amp:101 },
        { awg:8,  mm2:8.366, amp:73 },
        { awg:10, mm2:5.261, amp:55 },
        { awg:12, mm2:3.309, amp:41 },
        { awg:14, mm2:2.081, amp:32 },
        { awg:16, mm2:1.309, amp:22 },
        { awg:18, mm2:0.823, amp:16 },
        { awg:20, mm2:0.518, amp:11 },
        { awg:22, mm2:0.326, amp:7 },
        { awg:24, mm2:0.205, amp:3.5 },
        { awg:26, mm2:0.129, amp:2.2 },
        { awg:28, mm2:0.081, amp:1.4 },
        { awg:30, mm2:0.051, amp:0.9 },
    ];

    // Render static reference table
    function renderAwgRefTable(highlightIdx) {
        let html = '<table><tr><th>AWG</th><th>Kesit (mm²)</th><th>Max Akım (A)</th></tr>';
        awgTable.forEach((row, i) => {
            html += `<tr class="${i === highlightIdx ? 'highlight' : ''}"><td>${row.awg}</td><td>${row.mm2}</td><td>${row.amp}</td></tr>`;
        });
        html += '</table>';
        document.getElementById('awg-table').innerHTML = html;
    }
    renderAwgRefTable(-1);

    document.getElementById('calc-awg-btn').addEventListener('click', () => {
        const current = parseFloat(document.getElementById('awg-current').value);
        const out = document.getElementById('awg-result-value'), panel = document.getElementById('awg-result-panel');
        if (isNaN(current) || current <= 0) { out.textContent = 'Geçerli bir akım değeri girin!'; panel.classList.add('show'); return; }

        // Find smallest AWG that can handle the current (search from thinnest to thickest)
        let found = null, foundIdx = -1;
        for (let i = awgTable.length - 1; i >= 0; i--) {
            if (awgTable[i].amp >= current) { found = awgTable[i]; foundIdx = i; }
            else break;
        }
        if (!found) { found = awgTable[0]; foundIdx = 0; }

        out.innerHTML = `<b>Önerilen:</b> AWG ${found.awg}<br><b>Kesit:</b> ${found.mm2} mm²<br><b>Max Akım:</b> ${found.amp} A`;
        panel.classList.add('show');
        renderAwgRefTable(foundIdx);
    });

    // ╔══════════════════════════════════════════════╗
    // ║  15. KARNAUGH HARİTASI (K-MAP)              ║
    // ╚══════════════════════════════════════════════╝
    const kmapVarsSel = document.getElementById('kmap-vars');
    const kmapGridArea = document.getElementById('kmap-grid-area');
    const kmapResult = document.getElementById('kmap-result-value');
    const kmapPanel = document.getElementById('kmap-result-panel');

    // Gray code orders for row/col headers
    const gray2 = ['00','01','11','10'];
    const gray1 = ['0','1'];

    let kmapCells = []; // flat array of cell values

    function buildKmap(n) {
        kmapPanel.classList.remove('show');
        let rows, cols, rowBits, colBits, rowVars, colVars;

        if (n === 2) {
            // 2 vars: A rows, B cols → 2x2
            rows = 2; cols = 2;
            rowBits = gray1; colBits = gray1;
            rowVars = 'A'; colVars = 'B';
        } else if (n === 3) {
            // 3 vars: A rows, BC cols → 2x4
            rows = 2; cols = 4;
            rowBits = gray1; colBits = gray2;
            rowVars = 'A'; colVars = 'BC';
        } else {
            // 4 vars: AB rows, CD cols → 4x4
            rows = 4; cols = 4;
            rowBits = gray2; colBits = gray2;
            rowVars = 'AB'; colVars = 'CD';
        }

        kmapCells = new Array(rows * cols).fill(0);

        let html = '<table class="kmap-table">';
        // Header row: corner + col headers
        html += `<tr><th class="kmap-corner"><span style="position:absolute;top:2px;right:4px;font-size:.55rem;color:var(--primary)">${colVars}</span><span style="position:absolute;bottom:2px;left:4px;font-size:.55rem;color:var(--t2)">${rowVars}</span></th>`;
        for (let c = 0; c < cols; c++) html += `<th class="kmap-rc">${colBits[c]}</th>`;
        html += '</tr>';

        for (let r = 0; r < rows; r++) {
            html += `<tr><th class="kmap-rc">${rowBits[r]}</th>`;
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                // Minterm index: combine row bits + col bits → decimal
                const bits = rowBits[r] + colBits[c];
                const mintermIdx = parseInt(bits, 2);
                html += `<td class="kmap-cell" data-val="0" data-idx="${idx}" data-mint="${mintermIdx}"><span class="kmap-idx">m${mintermIdx}</span>0</td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        kmapGridArea.innerHTML = html;

        // Attach click handlers
        kmapGridArea.querySelectorAll('.kmap-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const idx = parseInt(cell.dataset.idx);
                const cur = kmapCells[idx];
                const next = cur === 0 ? 1 : cur === 1 ? 'X' : 0;
                kmapCells[idx] = next;
                cell.dataset.val = String(next);
                const mint = cell.dataset.mint;
                cell.innerHTML = `<span class="kmap-idx">m${mint}</span>${next}`;
            });
        });
    }

    kmapVarsSel.addEventListener('change', () => buildKmap(parseInt(kmapVarsSel.value)));
    buildKmap(4);

    // Clear button
    document.getElementById('kmap-clear-btn').addEventListener('click', () => {
        buildKmap(parseInt(kmapVarsSel.value));
    });

    // ── K-MAP SOLVER (SOP Simplification) ──
    document.getElementById('kmap-solve-btn').addEventListener('click', () => {
        const n = parseInt(kmapVarsSel.value);
        const varNames = ['A','B','C','D'].slice(0, n);

        // Collect minterms (1s) and don't-cares (Xs)
        const ones = [], dcs = [];
        const gridEl = kmapGridArea.querySelectorAll('.kmap-cell');
        gridEl.forEach(cell => {
            const mint = parseInt(cell.dataset.mint);
            const val = kmapCells[parseInt(cell.dataset.idx)];
            if (val === 1) ones.push(mint);
            else if (val === 'X') dcs.push(mint);
        });

        if (ones.length === 0) {
            kmapResult.textContent = 'F = 0 (Hiç 1 yok)';
            kmapPanel.classList.add('show'); return;
        }

        const totalCells = Math.pow(2, n);
        if (ones.length + dcs.length === totalCells) {
            kmapResult.textContent = 'F = 1';
            kmapPanel.classList.add('show'); return;
        }

        // Quine-McCluskey style: find all prime implicants
        const allTerms = ones.concat(dcs);

        // Generate all possible rectangular groups (powers of 2 sizes)
        // Each implicant is a mask: for n bits, where '-' means that bit is covered
        function getImplicants() {
            const implicants = [];
            const sizes = [];
            for (let s = 1; s <= totalCells; s *= 2) sizes.push(s);

            // Try all group sizes
            for (const size of sizes) {
                // Find all factor pairs (rows x cols) that are powers of 2
                for (let rSize = 1; rSize <= size; rSize *= 2) {
                    const cSize = size / rSize;
                    if (cSize < 1) continue;
                    // Check that cSize is power of 2
                    if ((cSize & (cSize - 1)) !== 0) continue;

                    let rows, cols;
                    if (n === 2) { rows = 2; cols = 2; }
                    else if (n === 3) { rows = 2; cols = 4; }
                    else { rows = 4; cols = 4; }

                    if (rSize > rows || cSize > cols) continue;

                    const rowOrder = rows === 2 ? [0,1] : [0,1,3,2]; // Gray code indices
                    const colOrder = cols === 2 ? [0,1] : [0,1,3,2];

                    // Try every starting position with wrapping
                    for (let rs = 0; rs < rows; rs++) {
                        for (let cs = 0; cs < cols; cs++) {
                            const mints = [];
                            let valid = true;
                            for (let dr = 0; dr < rSize && valid; dr++) {
                                for (let dc = 0; dc < cSize && valid; dc++) {
                                    const r = (rs + dr) % rows;
                                    const c = (cs + dc) % cols;
                                    // Convert grid position to minterm using Gray code
                                    const rowGray = rows === 2 ? gray1[rowOrder[r]] : gray2[rowOrder[r]];
                                    const colGray = cols === 2 ? gray1[colOrder[c]] : gray2[colOrder[c]];
                                    const bits = rowGray + colGray;
                                    const mint = parseInt(bits, 2);
                                    if (!allTerms.includes(mint)) { valid = false; break; }
                                    mints.push(mint);
                                }
                            }
                            if (valid && mints.length === size) {
                                // Sort and deduplicate
                                const key = [...mints].sort((a,b)=>a-b).join(',');
                                if (!implicants.some(im => im.key === key)) {
                                    implicants.push({ mints, key, size });
                                }
                            }
                        }
                    }
                }
            }
            return implicants;
        }

        const allImpl = getImplicants();

        // Find prime implicants (not contained in any larger group)
        const primes = allImpl.filter(im => {
            return !allImpl.some(other =>
                other.size > im.size &&
                im.mints.every(m => other.mints.includes(m))
            );
        });

        // Greedy covering: select minimum set of PIs that cover all ones
        const uncovered = new Set(ones);
        const selected = [];

        while (uncovered.size > 0) {
            // Find PI that covers most uncovered ones
            let best = null, bestCount = 0;
            for (const pi of primes) {
                const count = pi.mints.filter(m => uncovered.has(m)).length;
                if (count > bestCount || (count === bestCount && best && pi.size > best.size)) {
                    best = pi; bestCount = count;
                }
            }
            if (!best || bestCount === 0) break;
            selected.push(best);
            best.mints.forEach(m => uncovered.delete(m));
        }

        // Convert selected PIs to SOP expression
        function implicantToTerm(mints) {
            // Find which bits are constant across all minterms
            const term = [];
            for (let bit = n - 1; bit >= 0; bit--) {
                const mask = 1 << bit;
                const vals = mints.map(m => (m & mask) ? 1 : 0);
                const allSame = vals.every(v => v === vals[0]);
                if (allSame) {
                    const varIdx = n - 1 - bit;
                    term.push(vals[0] === 1 ? varNames[varIdx] : varNames[varIdx] + "'");
                }
            }
            return term.length === 0 ? '1' : term.join('');
        }

        if (selected.length === 0) {
            kmapResult.textContent = 'F = 0';
        } else {
            const expr = selected.map(pi => implicantToTerm(pi.mints)).join(' + ');
            kmapResult.innerHTML = `<b>F =</b> ${expr}<br><span style="font-size:.72rem;color:var(--t2)">Kullanılan ${selected.length} grup, ${ones.length} minterm</span>`;
        }
        kmapPanel.classList.add('show');
    });

    // ╔══════════════════════════════════════════════════════╗
    // ║  16. ELEKTRİK MAKİNELERİ TEMELLERİ                 ║
    // ╚══════════════════════════════════════════════════════╝
    const emPartInfo = {
        stator: {
            title: '🧲 Stator (Sabit Kısım)',
            text: 'Motorun dışında sabit duran gövdedir. İçinde sargılar (bobinler) bulunur ve besleme gerilimi uygulandığında manyetik alan üretir. DC motorlarda sabit mıknatıs veya alan sargısı olabilir. AC motorlarda ise döner manyetik alan oluşturarak rotorun dönmesini sağlar. Stator malzemesi genellikle silisli çelik sacdır — bu, eddy akım kayıplarını minimize eder.'
        },
        rotor: {
            title: '⚙️ Rotor (Dönen Kısım)',
            text: 'Motorun merkezinde dönen kısımdır. Statorun oluşturduğu manyetik alan ile etkileşime girerek döndürme momenti (tork) üretir. Rotor mili, mekanik yükü (fan, pompa, tekerlek vb.) sürmek için kullanılır. Asenkron motorlarda "sincap kafesi" tipi rotor yaygındır — kısa devre halkaları ile birbirine bağlı iletken çubuklar içerir.'
        },
        enduvi: {
            title: '🔌 Endüvi (Armatür Sargısı)',
            text: 'Rotor üzerine sarılmış tel bobinlerdir. DC motorlarda buraya doğru akım gelir ve manyetik alanla etkileşerek döndürme kuvveti oluşur (Lorentz Kuvveti: F = BIL). Jeneratör modunda ise tam tersi olur — dönen endüvi sargılarında Faraday Yasası gereği EMK (Elektromotor Kuvvet) indüklenir: e = -dΦ/dt. Sargı tur sayısı ve manyetik akı arttıkça üretilen gerilim de artar.'
        },
        komutator: {
            title: '🔄 Komütatör',
            text: 'DC motorlara özgü bir mekanik anahtardır. Rotorla birlikte döner ve her yarım turda akım yönünü değiştirir (komütasyon). Bu sayede rotorun sürekli aynı yönde dönmesi sağlanır. Bakır segmentlerden oluşur ve fırçalar aracılığıyla dış devreyle temas eder. Komütatör olmasa, armatür sargısı yarım tur sonra zıt yönde kuvvet üretir ve rotor durur.'
        },
        firca: {
            title: '🖌️ Fırçalar (Kömür Fırçalar)',
            text: 'Karbon veya grafit malzemeden yapılmış, komütatöre sürtünen parçalardır. Sabit (stator tarafı) durup, dönen komütatöre akım iletimini sağlar. Mekanik temas nedeniyle zamanla aşınır ve periyodik bakım gerektirir. Bu dezavantaj, fırçasız (brushless) DC motorların geliştirilmesine yol açmıştır. Fırça basıncı çok önemlidir — fazla basınç aşınmayı artırır, az basınç ise kıvılcımlanmaya neden olur.'
        }
    };

    let emMode = 'motor'; // 'motor' or 'generator'

    // Mode switch
    const emMotorBtn = document.getElementById('em-motor-mode');
    const emGenBtn = document.getElementById('em-gen-mode');
    const emSubtitle = document.getElementById('em-subtitle');
    const emFlowArrows = document.getElementById('em-flow-arrows');

    function setEmMode(mode) {
        emMode = mode;
        emMotorBtn.classList.toggle('em-mode-active', mode === 'motor');
        emGenBtn.classList.toggle('em-mode-active', mode === 'generator');

        if (mode === 'motor') {
            emSubtitle.textContent = 'Elektrik enerjisi → Mekanik enerji';
            emFlowArrows.innerHTML = `
                <polygon points="5,145 15,150 5,155" fill="#00f3ff" opacity="0.7"/>
                <text x="2" y="140" fill="#00f3ff" font-size="8" font-family="Outfit">Elektrik</text>
                <polygon points="215,150 225,145 225,155" fill="#00ff88" opacity="0.7"/>
                <line x1="220" y1="150" x2="290" y2="150" stroke="#00ff88" stroke-width="1.5" stroke-dasharray="5,3"/>
                <text x="255" y="140" fill="#00ff88" font-size="8" font-family="Outfit">Hareket</text>`;
        } else {
            emSubtitle.textContent = 'Mekanik enerji → Elektrik enerjisi';
            emFlowArrows.innerHTML = `
                <polygon points="295,145 285,150 295,155" fill="#00ff88" opacity="0.7"/>
                <text x="255" y="140" fill="#00ff88" font-size="8" font-family="Outfit">Hareket</text>
                <polygon points="15,150 5,145 5,155" fill="#00f3ff" opacity="0.7"/>
                <line x1="5" y1="150" x2="75" y2="150" stroke="#00f3ff" stroke-width="1.5" stroke-dasharray="5,3"/>
                <text x="20" y="140" fill="#00f3ff" font-size="8" font-family="Outfit">Elektrik</text>`;
        }
    }

    emMotorBtn.addEventListener('click', () => setEmMode('motor'));
    emGenBtn.addEventListener('click', () => setEmMode('generator'));

    // Clickable parts
    const emInfoTitle = document.getElementById('em-info-title');
    const emInfoText = document.getElementById('em-info-text');
    const emInfoCard = document.getElementById('em-info-card');

    document.querySelectorAll('.em-part').forEach(part => {
        part.addEventListener('click', (e) => {
            e.stopPropagation();
            const partId = part.dataset.part;
            const info = emPartInfo[partId];
            if (!info) return;

            // Remove previous selection
            document.querySelectorAll('.em-part.em-selected').forEach(p => p.classList.remove('em-selected'));
            // Select all elements of this part
            document.querySelectorAll(`.em-part[data-part="${partId}"]`).forEach(p => p.classList.add('em-selected'));

            emInfoTitle.textContent = info.title;
            emInfoText.textContent = info.text;
            emInfoCard.classList.add('em-info-visible');
        });
    });

    // Click outside to deselect
    document.getElementById('em-svg').addEventListener('click', (e) => {
        if (!e.target.closest('.em-part')) {
            document.querySelectorAll('.em-part.em-selected').forEach(p => p.classList.remove('em-selected'));
            emInfoCard.classList.remove('em-info-visible');
            emInfoTitle.textContent = 'Bir parça seçin';
            emInfoText.textContent = 'Yukarıdaki şemada herhangi bir parçaya dokunarak teknik açıklamasını görün.';
        }
    });

    // ╔══════════════════════════════════════════════╗
    // ║  17. DC MOTOR TORK & GÜÇ HESAPLAYICI        ║
    // ╚══════════════════════════════════════════════╝
    document.getElementById('calc-dctork-btn').addEventListener('click', () => {
        const v = parseFloat(document.getElementById('dct-v').value);
        const i = parseFloat(document.getElementById('dct-i').value);
        const rpm = parseFloat(document.getElementById('dct-rpm').value);
        const eff = parseFloat(document.getElementById('dct-eff').value);
        const out = document.getElementById('dctork-result-value');
        const panel = document.getElementById('dctork-result-panel');

        if (isNaN(v) || isNaN(i) || isNaN(rpm) || isNaN(eff) || rpm <= 0 || eff <= 0) {
            out.textContent = 'Tüm değerleri doğru girin! (RPM ve Verim > 0)';
            panel.classList.add('show'); return;
        }

        const eta = eff / 100;
        const pIn = v * i;
        const pMech = pIn * eta;
        const hp = pMech / 746;
        const omega = (2 * Math.PI * rpm) / 60;
        const torque = pMech / omega;

        out.innerHTML =
            `<b>P<sub>giriş</sub>:</b> ${pIn.toFixed(2)} W<br>` +
            `<b>P<sub>mekanik</sub>:</b> ${pMech.toFixed(2)} W <span style="color:var(--t2)">(${hp.toFixed(3)} HP)</span><br>` +
            `<b>Tork (T):</b> ${torque.toFixed(4)} Nm`;
        panel.classList.add('show');
    });

});
