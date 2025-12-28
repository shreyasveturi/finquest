import type { Lesson, ReasoningLinksBlock } from '@/types/lesson';
import {
  ARTICLE_PARAGRAPHS as RR_PARAGRAPHS,
  ARTICLE_TITLE as RR_TITLE,
  ARTICLE_SOURCE as RR_SOURCE,
  ARTICLE_URL as RR_URL,
  KEY_TERMS as RR_TERMS,
  CHECKPOINTS as RR_CHECKPOINTS,
  GOOGLE_FORM as RR_GOOGLE_FORM,
} from '@/content/rachelReevesBudget';

const rrLesson: Lesson = {
  slug: 'rachel-reeves-budget',
  title: "UK Budget: Reeves signals fiscal stance",
  subtitle: 'Spending, taxation, and market implications',
  attribution: RR_SOURCE,
  articleTitle: RR_TITLE,
  articleSource: RR_SOURCE,
  articleUrl: RR_URL,
  articleId: 'rachel-reeves-budget',
  paragraphs: RR_PARAGRAPHS,
  keyTerms: RR_TERMS,
  checkpoints: RR_CHECKPOINTS,
  predictionChoices: undefined,
  predictionCorrectId: undefined,
};

const chipReasoning: ReasoningLinksBlock[] = [
  {
    paragraphId: 'chip-p1',
    summary: 'Delayed tariffs signal policy caution while keeping leverage.',
    links: [
      { title: 'Tariff timing → inflation', prompt: 'Why would delaying tariffs ease near-term inflation pressures compared to immediate hikes?' },
      { title: 'Market confidence', prompt: 'How might deferring action steady equities or credit spreads in semiconductor supply chains?' },
      { title: 'Capacity build-out', prompt: 'What signals would fabs or foundries need to accelerate US capacity ahead of 2027?' },
    ],
  },
  {
    paragraphId: 'chip-p4',
    summary: 'Trade-offs between pressure on China and domestic macro risks.',
    links: [
      { title: 'Supply chain disruption', prompt: 'Map which nodes (EDA, equipment, wafers) are most exposed to countermeasures.' },
      { title: 'Inflation vs. resilience', prompt: 'When do higher input costs become acceptable for strategic resilience?' },
      { title: 'FX and capital flows', prompt: 'Could prolonged tension move FX or portfolio flows into havens or out of EM Asia?' },
    ],
  },
  {
    paragraphId: 'chip-p7',
    summary: 'Strategic resources as leverage beyond tariffs.',
    links: [
      { title: 'Rare earth supply risk', prompt: 'Which downstream sectors reprice first if rare earth exports are tightened?' },
      { title: 'Inventory buffers', prompt: 'How long can EV/defence OEMs run on existing inventories before margins crack?' },
      { title: 'Retaliation ladder', prompt: 'What non-tariff measures might follow before markets reprice sharply?' },
    ],
  },
  {
    paragraphId: 'chip-p8',
    summary: 'National security tools as parallel pressure.',
    links: [
      { title: 'NS investigation', prompt: 'What outcomes from a national security probe could matter more than tariffs for chipmakers?' },
      { title: 'Exemptions for onshore build', prompt: 'How do carve-outs for US fabs alter capex incentives and valuations?' },
      { title: 'Global spillovers', prompt: 'Could allied supply chains realign to mitigate US–China friction, and who benefits?' },
    ],
  },
];

const chipLesson: Lesson = {
  slug: 'us-china-chip-trade-practices',
  title: 'US accuses China of unfair chip practices but delays tariff increases until 2027',
  subtitle: 'Semiconductors, tariffs, and global supply chains',
  attribution:
    'Educational summary based on reporting by the Financial Times (Dec 23–24, 2025). Used for learning and commentary purposes.',
  articleTitle: 'US accuses China of unfair chip practices but delays tariff increases until 2027',
  articleSource: 'Financial Times, Dec 23–24 2025 (educational paraphrase)',
  articleUrl: 'https://www.ft.com/content/a1274e4a-baf3-4f63-82f6-2758af1aa745',
  articleId: 'us-china-chip-trade-practices',
  expertReasoning: {
    shock: 'US government formally accuses China of unfair chip practices and weaponising dependencies. However, tariff increases are delayed until mid-2027, not applied immediately.',
    channel: 'The delay acts as a moderate signal: markets interpret it as caution on near-term inflation and supply disruption, but uncertainty about future tariffs keeps firms cautious on capex. Retaliation risk from China remains elevated.',
    impact: 'US chipmakers and fabs face both opportunity (tariffs could boost domestic valuations long-term) and risk (delays weaken deterrence). Chip equipment makers and EDA firms exposed to China see margin pressure. Global manufacturers face supply chain uncertainty. Consumer-facing firms see inflation risk if tariffs eventually materialize.',
    channels: [
      'Inflation / prices',
      'Supply chains',
      'Retaliation / geopolitics',
      'Investment / capex',
      'Regulation / national security',
    ],
    winners: ['US chipmakers', 'Global manufacturers'],
    losers: ['Chinese firms', 'Global manufacturers'],
  },
  predictionChoices: [
    { id: 'delay-tariffs', label: 'US cites unfair practices but delays tariff hikes to 2027+' },
    { id: 'immediate-tariffs', label: 'US slaps immediate, sharp chip tariffs on China' },
    { id: 'status-quo', label: 'US keeps current chip measures with no new action' },
    { id: 'compromise', label: 'US reduces chip measures after concessions from China' },
  ],
  predictionCorrectId: 'delay-tariffs',
  paragraphs: [
    {
      id: 'chip-p1',
      text: 'The US government has accused China of using unfair trade practices to try to secure dominance across the global semiconductor supply chain, while stopping short of imposing immediate additional tariffs on Chinese chip imports. Instead, officials said any increase in levies would be delayed until at least mid-2027, a move that reflects the political and economic sensitivity surrounding chips, inflation, and global trade.',
    },
    {
      id: 'chip-p2',
      text: 'The findings were published by the US Trade Representative (USTR) following a year-long investigation into Beijing’s semiconductor industry, which was initiated under the previous administration. According to the report, China has developed the ability to weaponise dependencies by embedding itself across critical segments of chip production, allowing it to exert pressure on other economies during periods of geopolitical tension.',
    },
    {
      id: 'chip-p3',
      text: 'US officials argued that China’s rise in the sector has not been driven purely by market forces. Instead, they pointed to a range of non-market advantages, including large-scale state subsidies, restricted market access for foreign competitors, and the use of industrial policy tools such as government-backed investment funds. The filing also echoed long-standing concerns in Washington around forced technology transfer and the protection of intellectual property.',
      checkpointId: 'chip-c1',
    },
    {
      id: 'chip-p4',
      text: 'Despite the critical tone of the report, the administration said it would not impose new tariffs immediately. While it reserved the right to raise levies from June 2027 onwards, it stressed that any final decision would be announced only shortly beforehand. The delay highlights concerns about inflationary pressures, potential supply chain disruption, and whether domestic chip manufacturing capacity can scale quickly enough to absorb higher trade barriers.',
    },
    {
      id: 'chip-p5',
      text: 'China’s foreign ministry responded by accusing the US of abusing trade measures to suppress Chinese industries, warning that such actions could disrupt global supply chains and ultimately harm the US economy itself. Officials in Beijing said China would take corresponding countermeasures if its legitimate interests were threatened, underscoring the risk of retaliation even in the absence of immediate tariff increases.',
      checkpointId: 'chip-c2',
    },
    {
      id: 'chip-p6',
      text: 'The report’s release comes ahead of a planned meeting between US President Donald Trump and Chinese leader Xi Jinping, expected in the coming months. It also follows a turbulent year in which escalating trade tensions periodically unsettled global financial markets, weakened business confidence, and raised concerns about the broader economic fallout from a prolonged US-China trade conflict.',
    },
    {
      id: 'chip-p7',
      text: 'Earlier in the year, tariffs between the two economies had been raised to extremely high levels before both sides agreed to de-escalate. During that period, China restricted exports of rare earth minerals, which are critical inputs for industries ranging from electric vehicles to defence systems, highlighting how trade disputes can spill over into control of strategic resources.',
    },
    {
      id: 'chip-p8',
      text: 'Although tariffs are currently on hold, the administration has signalled that it retains a broad toolkit to address concerns about the semiconductor sector. This includes a separate national security investigation and the possibility of imposing very high chip tariffs in the future, while exempting companies that commit to building manufacturing capacity within the US.',
      checkpointId: 'chip-c3',
    },
  ],
  keyTerms: [
    { id: 'chip-t1', term: 'unfair trade practices', friendlyDefinition: 'Policies or actions that tilt competition in favor of domestic firms by distorting markets.', whyItMatters: 'Signals potential retaliatory measures and trade friction that can hit supply chains and prices.' },
    { id: 'chip-t2', term: 'semiconductor supply chain', friendlyDefinition: 'The global network spanning chip design, equipment, fabrication, packaging, and distribution.', whyItMatters: 'Concentration or chokepoints can create geopolitical leverage and market risk.' },
    { id: 'chip-t3', term: 'tariffs', friendlyDefinition: 'Taxes on imported goods.', whyItMatters: 'They raise costs, shift sourcing, and can spark retaliation affecting trade and inflation.' },
    { id: 'chip-t4', term: 'US Trade Representative (USTR)', friendlyDefinition: 'The US agency that develops and coordinates trade policy.', whyItMatters: 'Its findings guide tariffs and trade negotiations that move markets.' },
    { id: 'chip-t5', term: 'weaponise dependencies', friendlyDefinition: 'Using another country’s reliance on your inputs as leverage.', whyItMatters: 'Creates supply risk and can trigger diversification or stockpiling in markets.' },
    { id: 'chip-t6', term: 'non-market advantages', friendlyDefinition: 'Benefits gained via state support or restrictions rather than open competition.', whyItMatters: 'Distorts pricing and competitiveness, prompting trade defenses.' },
    { id: 'chip-t7', term: 'state subsidies', friendlyDefinition: 'Government financial support to domestic industries.', whyItMatters: 'Can undercut rivals’ prices and provoke countervailing measures.' },
    { id: 'chip-t8', term: 'industrial policy', friendlyDefinition: 'Government strategies to promote specific sectors through funding or regulation.', whyItMatters: 'Shapes global capacity, pricing power, and trade tensions.' },
    { id: 'chip-t9', term: 'forced technology transfer', friendlyDefinition: 'Pressure on foreign firms to share tech to access a market.', whyItMatters: 'Erodes IP value and spurs protective trade or investment rules.' },
    { id: 'chip-t10', term: 'intellectual property', friendlyDefinition: 'Legal rights over inventions, designs, and creative works.', whyItMatters: 'Core to competitive advantage; disputes drive trade and legal action.' },
    { id: 'chip-t11', term: 'inflationary pressures', friendlyDefinition: 'Forces that push prices higher across the economy.', whyItMatters: 'Tariff timing can raise or delay inflation, affecting rates and valuations.' },
    { id: 'chip-t12', term: 'supply chain disruption', friendlyDefinition: 'Breaks or delays in production and logistics networks.', whyItMatters: 'Hits output, margins, and inventories, moving prices and risk premia.' },
    { id: 'chip-t13', term: 'countermeasures', friendlyDefinition: 'Retaliatory actions taken in response to another country’s measures.', whyItMatters: 'Escalation risk for trade flows, corporate plans, and market sentiment.' },
    { id: 'chip-t14', term: 'retaliation', friendlyDefinition: 'Punitive response to another country’s policy.', whyItMatters: 'Raises uncertainty and can widen the economic impact beyond the target.' },
    { id: 'chip-t15', term: 'rare earth minerals', friendlyDefinition: 'Critical elements used in electronics, EVs, and defence systems.', whyItMatters: 'Supply control creates leverage and price volatility across industries.' },
    { id: 'chip-t16', term: 'national security investigation', friendlyDefinition: 'A probe assessing risks to national security from specific sectors or imports.', whyItMatters: 'Can justify strict trade actions and reshape supply chains.' },
  ],
  checkpoints: [
    {
      id: 'chip-c1',
      title: 'US stance and timing',
      paragraphId: 'chip-p3',
      prompt: 'In 4–6 sentences, explain the US policy stance on China’s chip industry and why the delayed timing of tariffs matters for firms and markets.',
      helperText: 'Cover the stance, the delay to 2027, and who feels the timing.',
      questionType: 'shortText',
      modelAnswer:
        'The US frames China’s chip rise as state-backed and distorting, citing subsidies, industrial policy, and forced tech transfer. It keeps tariff escalation on the table but defers action to at least mid-2027, balancing pressure with inflation and supply-chain risk. The delay gives time for domestic capacity to build and for markets to adjust sourcing. Firms get planning runway; markets see reduced near-term price shocks but lingering policy uncertainty.',
      hint: 'Mention non-market advantages, the 2027 window, and why timing shifts risk for firms and prices.',
    },
    {
      id: 'chip-c2',
      title: 'Macro-to-market channels',
      paragraphId: 'chip-p5',
      prompt: 'Identify three macro-to-market transmission channels in this story. For each, explain who is affected and how it could show up in prices, margins, investment, or supply risk.',
      helperText: 'Think inflation, supply chains, and confidence/sentiment.',
      questionType: 'shortText',
      modelAnswer:
        'Channel 1: Inflation/input costs — tariffs or countermeasures raise component prices, squeezing margins for OEMs and potentially lifting consumer prices. Channel 2: Supply chain reliability — retaliation or export curbs (e.g., rare earths) elevate supply risk, prompting inventory build and capex shifts; equity risk premia rise. Channel 3: Confidence and capex — prolonged tension chills cross-border investment; firms delay fabs or reroute supply, impacting valuations and spreads. Each channel alters pricing, margins, investment timing, and perceived supply security.',
      hint: 'Map to prices/margins, supply reliability, and confidence/capex; name who is exposed.',
    },
    {
      id: 'chip-c3',
      title: 'Case for delay vs. action',
      paragraphId: 'chip-p8',
      prompt: 'What is the strongest argument for delaying tariffs, and the strongest argument against it? End with your judgement and one indicator you would monitor in 2026.',
      helperText: 'Balance inflation/supply risk vs. leverage/credibility.',
      questionType: 'shortText',
      modelAnswer:
        'For delay: Avoid near-term inflation and supply shocks, buy time to onshore capacity, and keep optionality before 2027. Against delay: Weakens deterrence, signals limited resolve, and lets China deepen dependencies. Judgement: delay is defensible if paired with capacity build and NS tools. Indicator: track US fab capex/utilization and lead times through 2026 to see if resilience is improving.',
      hint: 'State one pro-delay and one anti-delay argument, then give your call plus a 2026 indicator.',
    },
  ],
  reasoningLinks: chipReasoning,
};

export const LESSONS: Lesson[] = [rrLesson, chipLesson];

export const DEFAULT_LESSON_SLUG = rrLesson.slug;

export const GOOGLE_FORM = RR_GOOGLE_FORM;
