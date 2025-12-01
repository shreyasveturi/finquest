// Financial Times article used for educational purposes only.
// Article: "Rachel Reeves' Budget raises UK tax take to all-time high"
// Authors: George Parker, Sam Fleming, Delphine Strauss, Ian Smith
// Published: November 26, 2025
// Source: https://www.ft.com/content/f8a8ad84-e351-4c7b-aa90-e5ce2bf665b4
// For educational use only. Not affiliated with the Financial Times.

export const ARTICLE_TITLE = "Rachel Reeves' Budget raises UK tax take to all-time high";
export const ARTICLE_SOURCE = "Financial Times, November 26 2025";
export const ARTICLE_URL = "https://www.ft.com/content/f8a8ad84-e351-4c7b-aa90-e5ce2bf665b4";

export type ArticleParagraph = {
  id: string;
  text: string;
  checkpointId?: string;
};

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

export type KeyTerm = {
  id: string;
  term: string;
  friendlyDefinition: string;
  whyItMatters: string;
};

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
    friendlyDefinition: 'The UK government minister responsible for managing the country\'s finances and setting economic policy.',
    whyItMatters: 'The Chancellor decides tax rates, spending priorities, and economic strategy.',
  },
  {
    id: 't3',
    term: 'Rachel Reeves',
    friendlyDefinition: 'The current UK Chancellor of the Exchequer, the person in charge of the country\'s budget.',
    whyItMatters: 'As Chancellor, Reeves decides tax and spending policies that affect all UK citizens.',
  },
  {
    id: 't4',
    term: 'taxes',
    friendlyDefinition: 'Money that people and businesses must pay to the government to fund public services.',
    whyItMatters: 'Taxes fund schools, hospitals, roads, and defense. Higher taxes mean more revenue but less money for households.',
  },
  {
    id: 't5',
    term: 'welfare spending',
    friendlyDefinition: 'Government money spent on benefits and support for people who need help, like unemployment benefits or child support.',
    whyItMatters: 'Affects poverty levels, social safety nets, and government budget balances.',
  },
  {
    id: 't6',
    term: 'GDP',
    friendlyDefinition: 'Gross Domestic Product — the total value of all goods and services produced in a country.',
    whyItMatters: 'GDP measures economic size and growth. A larger GDP usually means more tax revenue.',
  },
  {
    id: 't7',
    term: 'tax thresholds',
    friendlyDefinition: 'Income levels at which different tax rates start to apply.',
    whyItMatters: 'Freezing thresholds means more people pay higher tax rates as wages rise with inflation.',
  },
  {
    id: 't8',
    term: 'pension',
    friendlyDefinition: 'A regular payment made during retirement to people who have saved or contributed during their working years.',
    whyItMatters: 'Pensions affect retirement security and are often supported by tax incentives.',
  },
  {
    id: 't9',
    term: 'salary sacrifice',
    friendlyDefinition: 'An arrangement where employees give up part of their salary in exchange for non-cash benefits, often reducing tax.',
    whyItMatters: 'Used to boost pension contributions or benefits while lowering tax bills.',
  },
  {
    id: 't10',
    term: 'landlords',
    friendlyDefinition: 'People who own property and rent it out to tenants.',
    whyItMatters: 'Tax changes on landlords affect rental markets and property investment.',
  },
  {
    id: 't11',
    term: 'fiscal headroom',
    friendlyDefinition: 'The space in a government budget to absorb shocks or increase spending without jeopardising finances.',
    whyItMatters: 'Shows how much flexibility the government has — important for markets and policy choices.',
  },
  {
    id: 't2',
    term: 'OBR',
    friendlyDefinition: 'Office for Budget Responsibility — an independent fiscal watchdog in the UK.',
    whyItMatters: 'OBR forecasts influence credibility of budgets and market reactions.',
  },
  {
    id: 't3',
    term: 'disposable income',
    friendlyDefinition: 'Income left after taxes and transfers that households can spend or save.',
    whyItMatters: 'Key for demand forecasts and consumer behaviour — affects GDP and markets.',
  },
  {
    id: 't4',
    term: 'mansion tax',
    friendlyDefinition: 'A tax on very high-value homes or properties.',
    whyItMatters: 'Politically salient and can target wealth, affecting property markets and high-income households.',
  },
  {
    id: 't5',
    term: 'council tax surcharge',
    friendlyDefinition: 'An additional local tax applied in specific circumstances.',
    whyItMatters: 'Alters local funding and can influence household disposable incomes regionally.',
  },
  {
    id: 't6',
    term: 'dividends',
    friendlyDefinition: 'Portions of a company’s profits paid to shareholders.',
    whyItMatters: 'Changes to dividend taxation affect investor income and corporate behaviour.',
  },
  {
    id: 't7',
    term: 'gilt yields',
    friendlyDefinition: 'Yields on UK government bonds; they reflect borrowing costs for the government.',
    whyItMatters: 'Moves in gilt yields change debt servicing costs and signal market confidence.',
  },
  {
    id: 't18',
    term: 'productivity forecasts',
    friendlyDefinition: 'Predictions for how output per worker will grow over time.',
    whyItMatters: 'Lower productivity forecasts reduce growth and tax revenue expectations, influencing fiscal choices.',
  },
  {
    id: 't19',
    term: 'inflation',
    friendlyDefinition: 'The rate at which prices for goods and services rise over time, reducing purchasing power.',
    whyItMatters: 'High inflation erodes savings and real wages, affecting living standards and economic policy.',
  },
  {
    id: 't20',
    term: 'bond markets',
    friendlyDefinition: 'Markets where governments and companies borrow money by selling bonds to investors.',
    whyItMatters: 'Bond market reactions signal investor confidence and affect government borrowing costs.',
  },
];

export type QuestionType = 'shortText' | 'thisOrThat';

export type Checkpoint = {
  id: string;
  title: string;
  paragraphId: string;
  prompt: string;
  helperText?: string;
  questionType: QuestionType;
  choices?: string[];
  modelAnswer: string;
  hint: string;
};

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
