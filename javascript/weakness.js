
let TYPE_CHART = null;
let ALL_TYPES = [];



async function loadTypeChart() {
	if (TYPE_CHART) return TYPE_CHART;
	try {
		const res = await fetch('data/types.json');
		const data = await res.json();
		TYPE_CHART = Array.isArray(data) ? data[0] : data;
		ALL_TYPES = Object.keys(TYPE_CHART);
		return TYPE_CHART;
	} catch (e) {
		console.error('Failed to load type chart from data/types.json', e);
		TYPE_CHART = {};
		ALL_TYPES = [];
		return TYPE_CHART;
	}
}


async function computeTypeEffectiveness(primary, secondary = null) {
	if (!primary) throw new Error('Primary type is required');

	await loadTypeChart();

	const normalize = t => {
		if (!t) return null;
		return String(t).toLowerCase();
	};

	const t1 = normalize(primary);
	const t2 = normalize(secondary);

	const multipliers = {};
	const neutrals = [];

	for (const att of ALL_TYPES) {
		const m1 = TYPE_CHART[att]?.[t1] ?? 1;
		const m2 = t2 ? (TYPE_CHART[att]?.[t2] ?? 1) : 1;
		const mult = m1 * m2;
		multipliers[att] = mult;
		if (mult === 1) neutrals.push(att);
	}

	const groups = { '4': [], '2': [], '1': neutrals, '0.5': [], '0.25': [], '0': [] };

	for (const [tipo, val] of Object.entries(multipliers)) {
		if (val >= 4) groups['4'].push(tipo);
		else if (val >= 2) groups['2'].push(tipo);
		else if (val === 0.25) groups['0.25'].push(tipo);
		else if (val === 0) groups['0'].push(tipo);
		else if (val > 0 && val <= 0.5) groups['0.5'].push(tipo);
		// values equal to 1 are already in '1'
	}

	return { multipliers, groups };
}

// Expose for both CommonJS and browser globals (lightweight compatibility)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { computeTypeEffectiveness, loadTypeChart };
}
if (typeof window !== 'undefined') {
	window.computeTypeEffectiveness = computeTypeEffectiveness;
	window.loadTypeChart = loadTypeChart;
}

