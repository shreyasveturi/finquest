// Financial Times article used for educational purposes only.
// Article: "Rachel Reeves' Budget raises UK tax take to all-time high"
// Authors: George Parker, Sam Fleming, Delphine Strauss, Ian Smith
// Published: November 26, 2025
// Source: https://www.ft.com/content/f8a8ad84-e351-4c7b-aa90-e5ce2bf665b4
// For educational use only. Not affiliated with the Financial Times.

export const ARTICLE_TITLE = "Rachel Reeves' Budget raises UK tax take to all-time high";
export const ARTICLE_SOURCE = "Financial Times, November 26 2025";
export const ARTICLE_URL = "https://www.ft.com/content/f8a8ad84-e351-4c7b-aa90-e5ce2bf665b4";

import type { ArticleParagraph, KeyTerm, Checkpoint, QuestionType } from '@/types/lesson';

export const ARTICLE_PARAGRAPHS: ArticleParagraph[] = [
  {
    id: 'p1',
    text: 'Chancellor Rachel Reeves delivered a Budget that takes UK taxes to an all-time high, hitting workers, the wealthy and business to fund higher welfare spending and build up her emergency buffer. Reeves, who increased taxes by £40bn in her first Budget last year, announced a further £26bn rise on Wednesday that will lift the overall burden to 38 per cent of GDP by the end of the parliament.',
  },
  {
    id: 'p2',
    text: '"I\'m asking everyone to make a contribution," said the chancellor, who later refused to rule out more tax rises in future Budgets. "I won\'t pretend otherwise." The Budget had a chaotic start, with the Office for Budget Responsibility accidentally publishing details of the chancellor\'s plan on Wednesday morning before she could announce it in parliament.',
    checkpointId: 'c1',
  },
  {
    id: 'p3',
    text: 'The package raises revenue through freezing tax thresholds, hitting pension salary sacrifice schemes and imposing new levies on property and dividends, with spending expanded by measures such as scrapping the two-child benefit cap. But much of the increased tax is due to come in several years\' time while the spending comes sooner. "Spend now, pay later" was the verdict of the Institute for Fiscal Studies.',
  },
  {
    id: 'p4',
    text: 'Official forecasts made for uncomfortable reading for Reeves, with downgrades to projections for both growth and household disposable incomes. Inflation will also be higher than previously forecast. But the bond markets welcomed her decision to increase the government\'s fiscal headroom — its budgetary room for manoeuvre — to £21.7bn by 2029-30, compared with £9.9bn at her last fiscal statement.',
    checkpointId: 'c2',
  },
  {
    id: 'p5',
    text: 'The OBR said a weaker growth outlook and rising tax burden would squeeze household finances, despite Reeves arguing that she was acting to cut living costs. The fiscal watchdog cut its forecast for households\' disposable income, which is now set to grow at an average pace of just 0.5 per cent a year, the second-worst period for living standards since the 1950s, according to the Resolution Foundation think-tank.',
  },
  {
    id: 'p6',
    text: 'Labour MPs cheered higher taxes on landlords and dividends, along with a new "mansion tax" on homes worth more than £2mn, but ordinary Labour voters will also take a big hit. Acknowledging that the Budget would have "a cost for working people", Reeves froze income tax thresholds for an extra three years, raising £12.7bn by 2030-31, by far the day\'s biggest single revenue-raiser.',
    checkpointId: 'c3',
  },
  {
    id: 'p7',
    text: 'The OBR predicted that one in four people would be caught by the 40 per cent higher rate of tax by the end of the forecast period. A separate policy to curb tax advantages of salary sacrifice schemes will hit employers hardest but employees are expected to see lower wages and lower pension contributions as a result.',
  },
  {
    id: 'p8',
    text: 'Reeves\' Budget will partly fund higher annual welfare spending, which is set to be £16bn more a year in 2029-30 than previously forecast by the OBR. That includes more than £3bn earmarked by Reeves for the abolition of the two-child benefit cap and is also boosted by inflation. That announcement won the biggest Labour cheer of the day, but the Conservatives warned that working people are paying higher taxes to fund extra benefits, especially to families with large numbers of children.',
  },
  {
    id: 'p9',
    text: 'The Budget was announced after the OBR accidentally published its assessment of Reeves\' statement an hour before she actually delivered it. A plainly furious chancellor said: "It is deeply disappointing and a serious error on their part." The OBR blamed a "technical error" and apologised, but the blunder added to a sense of disarray around the Budget process.',
  },
  {
    id: 'p10',
    text: 'The fiscal watchdog had already infuriated Reeves by choosing this moment to address Britain\'s long-standing productivity problems, cutting its productivity growth forecasts by 0.3 percentage points with the loss of £16bn in projected tax revenues. However, stronger than expected tax revenues over the OBR forecast, including from higher real wage growth, helped to provide the chancellor with more room for manoeuvre than some expected.',
  },
  {
    id: 'p11',
    text: 'Reeves\' decision to boost her fiscal headroom reassured investors, giving gilt markets a boost and pushing 10-year borrowing costs down 0.08 percentage points to 4.42 per cent. "We feel comfortable to come back to the UK market and add gilt exposure," said Ales Koutny, head of international rates at Vanguard, the world\'s second-largest asset manager.',
  },
  {
    id: 'p12',
    text: 'Among the other tax measures introduced by Reeves are charges on electric cars raising £1.4bn, gambling duty reform to bring in £1.1bn, and a council tax surcharge on homes worth more than £2mn, which will raise £400mn in 2029-2030. The surcharge will be introduced from April 2028 and will take the form of a recurring annual levy.',
  },
  {
    id: 'p13',
    text: 'Dividends will also be more highly taxed. From April 2026, a 2 percentage point increase to the basic and higher rates of tax on dividends will lift them to 10.75 and 35.75 per cent respectively, raising £1.2bn a year on average from 2027. Reeves insisted that by freezing income tax thresholds rather than raising rates she had "kept every single one of our manifesto commitments".',
  },
  {
    id: 'p14',
    text: 'But Kemi Badenoch, Conservative leader, said Reeves should resign. "She has broken every single one of her promises," she said, adding that the Budget was "a total humiliation". The fiscal package comes after Reeves\' post-election Budget last year raised taxes by the most since the early 1990s.',
  },
  {
    id: 'p15',
    text: 'It represents a breach of the chancellor\'s subsequent vow not to come back for more taxes and will pile pressure on an economy that has been struggling to gain momentum. UK inflation is forecast to average 3.5 per cent in 2025, up from the 3.2 per cent expected in March, according to the OBR. Inflation is set to decline to 2.5 per cent in 2026, compared with 2.1 per cent forecast in the spring.',
  },
];

export const KEY_TERMS: KeyTerm[] = [
  {
    id: 't1',
    term: 'Budget',
    friendlyDefinition: 'A government plan outlining how much money it will collect (taxes) and spend over the year.',
    whyItMatters: 'Budgets shape public services, economic growth, and determine who pays what taxes.',
  },
  {
    id: 't2',
    term: 'Chancellor',
    friendlyDefinition: 'The UK finance minister in charge of tax, spending, and economic policy.',
    whyItMatters: 'The Chancellor sets budgets that impact households, businesses, and markets.',
  },
  {
    id: 't3',
    term: 'Rachel Reeves',
    friendlyDefinition: 'The current UK Chancellor of the Exchequer leading this Budget.',
    whyItMatters: 'Her decisions shape taxes, spending, and market confidence.',
  },
  {
    id: 't4',
    term: 'taxes',
    friendlyDefinition: 'Money people and businesses pay to the government to fund public services.',
    whyItMatters: 'Higher taxes raise revenue but reduce take-home pay and profits.',
  },
  {
    id: 't5',
    term: 'welfare spending',
    friendlyDefinition: 'Government support for people who need financial help, like benefits for children or the unemployed.',
    whyItMatters: 'Affects poverty, living standards, and the budget balance.',
  },
  {
    id: 't6',
    term: 'GDP',
    friendlyDefinition: 'Gross Domestic Product — the total value of everything produced in the economy.',
    whyItMatters: 'Bigger GDP usually means higher tax revenue and more fiscal room.',
  },
  {
    id: 't7',
    term: 'tax thresholds',
    friendlyDefinition: 'Income levels where higher tax rates start to apply.',
    whyItMatters: 'Freezing thresholds drags more people into higher tax bands as wages rise.',
  },
  {
    id: 't8',
    term: 'pension',
    friendlyDefinition: 'Income paid in retirement, often supported by tax breaks during working years.',
    whyItMatters: 'Policy changes alter retirement security and employer costs.',
  },
  {
    id: 't9',
    term: 'salary sacrifice schemes',
    friendlyDefinition: 'Deals where employees swap cash pay for benefits to reduce tax or boost pensions.',
    whyItMatters: 'Policy shifts can change take-home pay and employer costs.',
  },
  {
    id: 't10',
    term: 'landlords',
    friendlyDefinition: 'People who own property and rent it to tenants.',
    whyItMatters: 'Tax changes for landlords influence rents and housing investment.',
  },
  {
    id: 't11',
    term: 'fiscal headroom',
    friendlyDefinition: 'Budget space the government has to handle shocks or extra spending without breaking its rules.',
    whyItMatters: 'More headroom reassures markets and gives flexibility for policy.',
  },
  {
    id: 't12',
    term: 'OBR',
    friendlyDefinition: 'Office for Budget Responsibility — the UK\'s independent fiscal watchdog.',
    whyItMatters: 'Its forecasts drive credibility and shape market reactions.',
  },
  {
    id: 't13',
    term: 'disposable incomes',
    friendlyDefinition: 'Household income left after taxes and benefits, available to spend or save.',
    whyItMatters: 'Signals living standards and consumer demand strength.',
  },
  {
    id: 't14',
    term: 'Resolution Foundation',
    friendlyDefinition: 'A UK think-tank focused on living standards and inequality.',
    whyItMatters: 'Their analysis frames public debate on how budgets hit households.',
  },
  {
    id: 't15',
    term: 'mansion tax',
    friendlyDefinition: 'A levy on very high-value homes.',
    whyItMatters: 'Targets wealth and can reshape luxury property demand.',
  },
  {
    id: 't16',
    term: 'council tax surcharge',
    friendlyDefinition: 'An extra local tax on certain properties, like expensive homes.',
    whyItMatters: 'Changes household bills and local revenue.',
  },
  {
    id: 't17',
    term: 'dividends',
    friendlyDefinition: 'Profit payouts from companies to shareholders.',
    whyItMatters: 'Higher dividend taxes hit investor income and portfolio returns.',
  },
  {
    id: 't18',
    term: 'gilt yields',
    friendlyDefinition: 'Interest rates the UK government pays on its bonds (gilts).',
    whyItMatters: 'Falling yields lower borrowing costs and often signal confidence.',
  },
  {
    id: 't19',
    term: 'gilt markets',
    friendlyDefinition: 'Where UK government bonds trade.',
    whyItMatters: 'Investor demand moves yields and reflects trust in fiscal policy.',
  },
  {
    id: 't20',
    term: 'productivity forecasts',
    friendlyDefinition: 'Expectations for how efficiently the economy will produce goods and services.',
    whyItMatters: 'Lower productivity squeezes growth and tax receipts, pressuring budgets.',
  },
  {
    id: 't21',
    term: 'inflation',
    friendlyDefinition: 'The rate at which prices rise, eroding purchasing power.',
    whyItMatters: 'Higher inflation hurts real wages and complicates fiscal plans.',
  },
  {
    id: 't22',
    term: 'bond markets',
    friendlyDefinition: 'Markets where governments and companies borrow by issuing bonds.',
    whyItMatters: 'Their reaction determines borrowing costs and signals risk appetite.',
  },
  {
    id: 't23',
    term: 'fiscal drag',
    friendlyDefinition: 'When frozen tax thresholds pull more income into higher tax bands as wages rise.',
    whyItMatters: 'Raises revenue quietly and can squeeze middle earners over time.',
  },
  {
    id: 't24',
    term: 'two-child benefit cap',
    friendlyDefinition: 'A UK rule limiting child-related benefits to the first two children.',
    whyItMatters: 'Scrapping it raises welfare spending and affects family incomes.',
  },
  {
    id: 't25',
    term: 'living standards',
    friendlyDefinition: 'A measure of household well-being, often tracked through income after inflation.',
    whyItMatters: 'Falling living standards signal pressure on consumers and political risk for budgets.',
  },
  {
    id: 't26',
    term: 'higher rate of tax',
    friendlyDefinition: 'The 40% income tax band in the UK that applies above a certain threshold.',
    whyItMatters: 'Freezing thresholds drags more earners into the higher rate, raising revenue.',
  },
  {
    id: 't27',
    term: 'wage growth',
    friendlyDefinition: 'How quickly pay is rising over time.',
    whyItMatters: 'Wage growth boosts tax receipts but can be eroded by inflation.',
  },
  {
    id: 't28',
    term: 'real wages',
    friendlyDefinition: 'Pay adjusted for inflation, showing true purchasing power.',
    whyItMatters: 'If real wages fall, households feel poorer even if nominal pay rises.',
  },
  {
    id: 't29',
    term: 'borrowing costs',
    friendlyDefinition: 'The interest rates the government pays to issue debt.',
    whyItMatters: 'Lower borrowing costs free fiscal room; higher costs squeeze budgets.',
  },
  {
    id: 't30',
    term: 'productivity growth',
    friendlyDefinition: 'Increases in output per worker or per hour worked.',
    whyItMatters: 'Higher productivity supports wage gains and tax revenue without inflation.',
  },
  {
    id: 't31',
    term: '40 per cent higher rate of tax',
    friendlyDefinition: 'The UK income tax band where earnings above a threshold are taxed at 40%, affecting middle-to-high earners.',
    whyItMatters: 'Frozen thresholds push more people into this band, increasing tax take over time.',
  },
  {
    id: 't32',
    term: 'fiscal watchdog (OBR)',
    friendlyDefinition: 'The Office for Budget Responsibility — an independent body that monitors and forecasts UK public finances.',
    whyItMatters: 'Its projections shape credibility of budgets and influence market reactions.',
  },
  {
    id: 't33',
    term: 'productivity growth forecasts',
    friendlyDefinition: 'Predictions of how efficiently the economy will produce goods and services in the future.',
    whyItMatters: 'Weaker forecasts cut expected tax revenues and tighten fiscal room.',
  },
  {
    id: 't34',
    term: 'gilt markets',
    friendlyDefinition: 'Markets where UK government bonds (“gilts”) are bought and sold.',
    whyItMatters: 'Moves in gilt demand change yields and government borrowing costs.',
  },
  {
    id: 't35',
    term: 'borrowing costs (10-year)',
    friendlyDefinition: 'The interest rate the UK government pays to borrow money for ten years.',
    whyItMatters: 'Lower long-term borrowing costs signal market confidence and free fiscal space.',
  },
  {
    id: 't36',
    term: 'annual levy',
    friendlyDefinition: 'A recurring yearly tax or fee imposed by the government.',
    whyItMatters: 'Creates ongoing revenue streams and affects property or business costs each year.',
  },
  {
    id: 't37',
    term: 'fiscal package',
    friendlyDefinition: 'The full set of tax and spending decisions announced in a Budget.',
    whyItMatters: 'Markets and voters judge the package as a whole for credibility and fairness.',
  },
  {
    id: 't38',
    term: 'inflation forecast',
    friendlyDefinition: 'The expected future rate of price increases.',
    whyItMatters: 'Shapes interest rates, wage talks, and real income expectations.',
  },
];

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: 'c1',
    title: 'Why choose taxes over cuts?',
    paragraphId: 'p2',
    prompt: 'The OBR downgraded productivity forecasts and real income growth. Why might this force Reeves to raise taxes rather than cut spending?',
    helperText: 'Think about tax revenue, spending commitments, and political trade-offs.',
    questionType: 'shortText',
    modelAnswer:
      'Lower productivity and incomes reduce tax revenue; to stabilise public finances the government may raise taxes which raises receipts faster than cutting protected spending, and politically it can be easier than major service cuts.',
    hint: 'Consider how lower growth affects tax receipts and the political cost of cutting services.',
  },
  {
    id: 'c2',
    title: 'Market reaction to gilt yields',
    paragraphId: 'p3',
    prompt: 'Gilt yields fell after the Budget. Is that more consistent with markets seeing this as credible fiscal tightening or reckless spending? Explain.',
    helperText: 'Think about what falling yields mean for confidence and borrowing costs.',
    questionType: 'shortText',
    modelAnswer:
      'Falling gilt yields generally indicate increased market confidence and lower perceived borrowing risk; this suggests markets viewed the measures as credible consolidation rather than reckless expansion.',
    hint: 'Falling yields = lower borrowing costs and often increased confidence.',
  },
  {
    id: 'c3',
    title: 'What is fiscal drag?',
    paragraphId: 'p4',
    prompt: 'Freezing income tax thresholds is sometimes called “fiscal drag”. What does this mean, and who is most affected over time?',
    helperText: 'Mention inflation or nominal wage growth and distributional impacts.',
    questionType: 'shortText',
    modelAnswer:
      'Fiscal drag occurs when thresholds are frozen so inflation or nominal wage growth pushes people into higher tax brackets, raising revenues without new rates. Over time it tends to hit middle-income earners as their nominal incomes rise.',
    hint: 'Think of inflation pushing nominal incomes into higher bands when thresholds don’t change.',
  },
];

export const GOOGLE_FORM = 'https://forms.gle/zh4w6jL81stBqf8q6';
