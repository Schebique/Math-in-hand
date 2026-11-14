// Autentické české datové sady pro variabilitu slovních úloh a praktických kontextů

export const CZECH_ROUTES = [
  { from: 'Prahy', to: 'Brna', distancePool: [180, 200, 210, 240] },
  { from: 'Plzně', to: 'Prahy', distancePool: [90, 100, 108, 120] },
  { from: 'Ostravy', to: 'Olomouce', distancePool: [90, 96, 105, 120] },
  { from: 'Českých Budějovic', to: 'Tábora', distancePool: [60, 72, 84, 90] },
  { from: 'Hradce Králové', to: 'Liberec', distancePool: [96, 110, 120, 144] },
  { from: 'Zlína', to: 'Brna', distancePool: [90, 100, 108, 120] },
] as const;

export const TOURIST_DESTINATIONS = [
  { name: 'rozhledně na Ještědu', mapUnit: 'turistické mapě Krkonoš a Jizerských hor' },
  { name: 'hradu Karlštejn', mapUnit: 'turistické mapě Českého krasu' },
  { name: 'prameni Vltavy', mapUnit: 'šumavské cyklomapě' },
  { name: 'Pravčické bráně', mapUnit: 'mapě Českého Švýcarska' },
  { name: 'vrcholu Lysé hory', mapUnit: 'beskydské turistické mapě' },
] as const;

export const RECIPES = [
  { dish: 'domácí bábovku', ingredient: 'polohrubé mouky', unit: 'g' },
  { dish: 'borůvkové lívance', ingredient: 'hladké mouky', unit: 'g' },
  { dish: 'těstovinový salát', ingredient: 'celozrnných těstovin', unit: 'g' },
  { dish: 'krémové rizoto', ingredient: 'kulatozrnné rýže', unit: 'g' },
  { dish: 'bramborové noky', ingredient: 'vařených brambor', unit: 'g' },
] as const;

export const ESHOP_PRODUCTS = [
  { item: 'bezdrátová sluchátka', context: 'elektronika' },
  { item: 'ergonomická klávesnice', context: 'IT vybavení' },
  { item: 'chytré sportovní hodinky', context: 'nositelná elektronika' },
  { item: 'grafický tablet pro studenty', context: 'kancelářská technika' },
  { item: 'turistický batoh 35 l', context: 'outdoorové vybavení' },
] as const;

export const SHARED_WORK_SCENARIOS = [
  {
    actor1: 'první čerpadlo',
    actor2: 'druhé čerpadlo',
    task: 'napuštění zahradního bazénu',
    verbDone: 'naplní bazén',
  },
  {
    actor1: 'zkušený malíř',
    actor2: 'jeho učeň',
    task: 'vymalování školní třídy',
    verbDone: 'vymaluje třídu',
  },
  {
    actor1: 'nový 3D tiskový plotr',
    actor2: 'starší tiskárna',
    task: 'vytištění sady součástek',
    verbDone: 'dokončí zakázku',
  },
  {
    actor1: 'první kombajn',
    actor2: 'druhý kombajn',
    task: 'sklizeň pšeničného pole',
    verbDone: 'sklidí celé pole',
  },
] as const;

export const LYCEUM_COMPANIES = [
  { name: 'studentská firma EkoLahev', product: 'nerezových lahví', singular: 'lahev' },
  { name: 'rodinná pražírna Káva+', product: 'balíčků zrnkové kávy', singular: 'balíček' },
  { name: 'dílna DesignPrint', product: 'plátěných tašek s potiskem', singular: 'taška' },
  { name: 'lokální výrobce Medový ráj', product: 'sklenic pastovaného medu', singular: 'sklenice' },
] as const;

export const UNIVERSITY_DOMAINS = [
  {
    subject: 'mikroekonomické analýzy',
    revenueLabel: 'celkový příjem R(q)',
    unit: 'licencí',
  },
  {
    subject: 'optimalizace výroby',
    revenueLabel: 'zisková funkce Z(q)',
    unit: 'výrobků',
  },
  {
    subject: 'cloudové infrastruktury',
    revenueLabel: 'výkonová metrika P(q)',
    unit: 'uzlů',
  },
] as const;
