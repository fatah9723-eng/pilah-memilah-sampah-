// Komponen Pembuat Grafik Batang 7 Hari SVG Mandiri (Pilah)

function renderGrafik7Hari(data7Hari, elemenWadah) {
  if (!elemenWadah) return;

  if (!data7Hari || data7Hari.length === 0) {
    elemenWadah.innerHTML = `
      <div class="keadaan-kosong" style="padding: 24px;">
        <p>Belum ada data aktivitas untuk 7 hari terakhir.</p>
      </div>
    `;
    return;
  }

  // Hitung nilai maksimum untuk penskalaan tinggi grafik
  const maxKg = Math.max(...data7Hari.map((d) => d.totalKg), 2); // minimal skala 2 kg
  const ceilingMax = Math.ceil(maxKg * 1.15 * 10) / 10; // beri sedikit ruang atas

  // Dimensi SVG
  const width = 480;
  const height = 210;
  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 24;
  const paddingBottom = 34;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const barWidth = 32;
  const step = chartWidth / data7Hari.length;

  // Garis-garis horizontal grid (0, tengah, max)
  const gridValues = [0, ceilingMax / 2, ceilingMax];
  let gridSvg = '';
  gridValues.forEach((val) => {
    const y = paddingTop + chartHeight - (val / ceilingMax) * chartHeight;
    gridSvg += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="garis-grid" stroke="var(--serat)" stroke-width="1" />
      <text x="${paddingLeft - 8}" y="${y + 4}" class="label-grafik" text-anchor="end" fill="var(--tinta-pudar)" font-size="10" font-family="var(--font-angka)">${val.toFixed(1)}</text>
    `;
  });

  // Gambar 7 batang
  let barsSvg = '';
  data7Hari.forEach((item, index) => {
    const x = paddingLeft + index * step + (step - barWidth) / 2;
    const barHeight = item.totalKg > 0 ? Math.max((item.totalKg / ceilingMax) * chartHeight, 4) : 0;
    const y = paddingTop + chartHeight - barHeight;
    const isToday = index === data7Hari.length - 1;
    const fillColor = item.totalKg > 0 ? (isToday ? 'var(--lumut)' : 'var(--warna-organik)') : 'transparent';
    const strokeColor = item.totalKg === 0 ? 'var(--serat)' : 'none';

    // Tooltip data
    const rincianText = Object.entries(item.rincian || {})
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}kg`)
      .join(', ');

    barsSvg += `
      <g class="grup-batang" tabindex="0" role="img" aria-label="${item.hariLabel}: ${item.totalKg} kg. ${rincianText}">
        <!-- Nilai angka di atas batang jika ada -->
        ${item.totalKg > 0 ? `
          <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-family="var(--font-angka)" font-size="11" font-weight="600" fill="var(--tinta)">
            ${item.totalKg}
          </text>
        ` : ''}

        <!-- Batang latar kosong jika 0 kg -->
        ${item.totalKg === 0 ? `
          <rect x="${x}" y="${paddingTop + chartHeight - 2}" width="${barWidth}" height="2" fill="var(--serat)" rx="1" />
        ` : ''}

        <!-- Batang dengan animasi transform scaleY -->
        <rect
          class="batang-grafik"
          x="${x}"
          y="${y}"
          width="${barWidth}"
          height="${barHeight}"
          rx="4"
          fill="${fillColor}"
          stroke="${strokeColor}"
          style="transform-origin: ${x + barWidth / 2}px ${paddingTop + chartHeight}px;"
        >
          <title>${item.hariLabel}: ${item.totalKg} kg ${rincianText ? '(' + rincianText + ')' : ''}</title>
        </rect>

        <!-- Label hari di sumbu X -->
        <text
          x="${x + barWidth / 2}"
          y="${height - 10}"
          class="label-grafik"
          fill="${isToday ? 'var(--lumut-tua)' : 'var(--tinta-pudar)'}"
          font-weight="${isToday ? '700' : '500'}"
          font-size="11"
        >
          ${item.hariSingkat}
        </text>
      </g>
    `;
  });

  elemenWadah.innerHTML = `
    <svg class="grafik-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="region" aria-label="Grafik batang setoran sampah 7 hari terakhir">
      ${gridSvg}
      ${barsSvg}
    </svg>
  `;
}

window.renderGrafik7Hari = renderGrafik7Hari;
