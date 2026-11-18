// Seed: каталог БАДов и спортивных добавок (Phase 3).
// Для каждой добавки: дозировка, тайминг, эффективность, побочные эффекты,
// противопоказания, источники, рекомендуемые цели тренировок.
// Структура соответствует типу Supplement из lib/types.ts (без id).
//
// ВАЖНО: Это НЕ медицинский совет. При приёме лекарств или хронических
// заболеваниях — проконсультируйся с врачом перед приёмом.

import type {
  Supplement,
  SupplementCategory,
  SupplementEfficacy,
} from "@/lib/types";

export const SUPPLEMENTS: Omit<Supplement, "id">[] = [
  // ============================================================
  // STRENGTH (3) — Для силы/мощи
  // ============================================================

  // 1. Креатин моногидрат
  {
    slug: "creatine-monohydrate",
    nameRu: "Креатин моногидрат",
    nameEn: "Creatine monohydrate",
    category: "strength" as SupplementCategory,
    descriptionRu:
      "Самое изученное и эффективное легальное средство для повышения силы и массы. Увеличивает запас фосфокреатина в мышцах, что продлевает работу в анаэробной зоне (5-15 сек).",
    descriptionEn:
      "The most studied and effective legal supplement for strength and mass. Increases phosphocreatine stores in muscles, extending anaerobic work (5-15 sec).",
    dosageRu:
      "3-5 г в день, без фазы загрузки. Эффект накопления — через 3-4 недели приёма. Фаза загрузки (20 г/день × 5-7 дней) необязательна и чаще вызывает ЖКТ-проблемы.",
    dosageEn:
      "3-5 g per day, no loading phase. Accumulation effect — after 3-4 weeks of intake. Loading phase (20 g/day × 5-7 days) is optional and often causes GI issues.",
    timingRu:
      "В любой день (тренировочный и нет). Лучше — после тренировки или утром вместе с углеводами/белком (улучшает усвоение). В дни отдыха — в любое время.",
    timingEn:
      "Any day (training or rest). Best — after workout or in the morning with carbs/protein (improves absorption). On rest days — anytime.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Одно из самых изученных добавок в истории спорта. Мета-анализ 2017 года (Forbes et al.) показал прирост силы 8% и массы 1-2 кг за 12 недель. ISSN position stand (2017) подтверждает эффективность для высокоинтенсивных упражнений. Эффект подтверждён в >500 исследованиях.",
    efficacyNotesEn:
      "One of the most studied supplements in sport history. A 2017 meta-analysis (Forbes et al.) showed 8% strength gain and 1-2 kg mass gain over 12 weeks. ISSN position stand (2017) confirms efficacy for high-intensity exercise. Effect confirmed in >500 studies.",
    sideEffectsRu:
      "Задержка воды в мышцах (1-2 кг, выглядит как «набор массы», но это вода). Возможны ЖКТ-проблемы при больших дозах (>10 г за раз) или без достаточного количества воды. Редко — судороги (не подтверждено исследованиями).",
    sideEffectsEn:
      "Water retention in muscles (1-2 kg, looks like «mass gain» but it's water). Possible GI issues at high doses (>10 g at once) or without enough water. Rarely — cramps (not confirmed by studies).",
    contraindicationsRu:
      "Заболевания почек в анамнезе (креатин метаболизируется почками — при нормальной функции безопасен). Подростки до 18 лет — только после консультации. Беременность и лактация — недостаточно данных.",
    contraindicationsEn:
      "History of kidney disease (creatine is metabolized by kidneys — safe with normal function). Adolescents under 18 — only after consultation. Pregnancy and lactation — insufficient data.",
    sources: [
      "ISSN position stand (2017)",
      "Examine.com — Creatine",
      "Forbes et al. 2017 meta-analysis",
    ],
    recommendedForGoals: ["bulk", "recomp", "strength"],
  },

  // 2. Бета-аланин
  {
    slug: "beta-alanine",
    nameRu: "Бета-аланин",
    nameEn: "Beta-alanine",
    category: "strength" as SupplementCategory,
    descriptionRu:
      "Аминокислота, повышающая уровень карнозина в мышцах. Карнозин буферизирует молочную кислоту, замедляя закисление мышц при упражнениях 60-240 секунд (ВИИТ, спринты, средние подходы).",
    descriptionEn:
      "Amino acid that increases muscle carnosine levels. Carnosine buffers lactic acid, slowing muscle acidification during 60-240 second exercise (HIIT, sprints, medium sets).",
    dosageRu:
      "3-6 г в день, разделить на 2-3 приёма (по 1.6-2 г) — снижает покалывание. Эффект накопительный — 4-8 недель для повышения карнозина на 40-60%.",
    dosageEn:
      "3-6 g per day, split into 2-3 doses (1.6-2 g each) — reduces tingling. Cumulative effect — 4-8 weeks to raise carnosine by 40-60%.",
    timingRu:
      "В любые дни (тренировочные и нет). Время приёма не критично — эффект накопительный, не острый. Можно принимать как до, так и после тренировки.",
    timingEn:
      "Any days (training or rest). Timing is not critical — effect is cumulative, not acute. Can be taken before or after workout.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Мета-анализ Hobson et al. (2012, n=360) показал прирост работоспособности 2.85% для упражнений 60-240 сек. Меньше эффекта для упражнений <60 сек и >240 сек. Для калистеники эффективен в подходах 8-15 повторений.",
    efficacyNotesEn:
      "Meta-analysis Hobson et al. (2012, n=360) showed 2.85% performance gain for 60-240 sec exercise. Less effect for <60 sec and >240 sec. Effective for calisthenics in 8-15 rep sets.",
    sideEffectsRu:
      "Парестезия (покалывание кожи) — безопасное, но неприятное ощущение, длится 30-60 минут. Снижается при дроблении дозы или приёме с едой. Не опасно.",
    sideEffectsEn:
      "Paresthesia (skin tingling) — safe but unpleasant sensation, lasts 30-60 minutes. Reduced by splitting doses or taking with food. Not dangerous.",
    contraindicationsRu:
      "Тяжёлые неврологические заболевания (без консультации врача). Беременность и лактация — недостаточно данных.",
    contraindicationsEn:
      "Severe neurological conditions (without doctor consultation). Pregnancy and lactation — insufficient data.",
    sources: [
      "Examine.com — Beta-alanine",
      "Hobson et al. 2012 meta-analysis",
      "ISSN position stand (2015)",
    ],
    recommendedForGoals: ["cut", "endurance"],
  },

  // 3. Цитруллин малат
  {
    slug: "citrulline-malate",
    nameRu: "Цитруллин малат",
    nameEn: "Citrulline malate",
    category: "strength" as SupplementCategory,
    descriptionRu:
      "Аминокислота, повышающая оксид азота (NO) и улучшающая кровоток. Снижает ощущение усталости, ускоряет выведение аммиака. Эффективен для выносливости и восстановления.",
    descriptionEn:
      "Amino acid that increases nitric oxide (NO) and improves blood flow. Reduces perceived fatigue, accelerates ammonia clearance. Effective for endurance and recovery.",
    dosageRu:
      "6-8 г L-цитруллина малата (2:1) за 60 минут до тренировки. Для накопительного эффекта — 8 г в день в течение 7-16 дней. Чистый L-цитруллин — 3-4 г.",
    dosageEn:
      "6-8 g L-citrulline malate (2:1) 60 minutes before workout. For cumulative effect — 8 g/day for 7-16 days. Pure L-citrulline — 3-4 g.",
    timingRu:
      "60 минут до тренировки — острый эффект (повышение NO и кровотока). Можно принимать ежедневно для накопительного эффекта.",
    timingEn:
      "60 minutes before workout — acute effect (NO and blood flow boost). Can be taken daily for cumulative effect.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Perez-Guisado (2010, n=41) показал +52% повторений в подходе и -40% мышечной боли спустя 48 часов. Бендхан (2017) подтвердил улучшение кровотока и снижения усталости. Особенно эффективен для высокообъёмных тренировок.",
    efficacyNotesEn:
      "Perez-Guisado (2010, n=41) showed +52% reps per set and -40% muscle soreness at 48 hours. Bendahan (2017) confirmed improved blood flow and reduced fatigue. Especially effective for high-volume training.",
    sideEffectsRu:
      "Редко — лёгкие ЖКТ-проблемы (тошнота, диарея) при больших дозах (>15 г). У некоторых — лёгкая гипотония из-за расширения сосудов.",
    sideEffectsEn:
      "Rarely — mild GI issues (nausea, diarrhea) at high doses (>15 g). In some — mild hypotension due to vasodilation.",
    contraindicationsRu:
      "Гипотония. Приём виагры/сиденафила или других доноров NO. Беременность и лактация — недостаточно данных.",
    contraindicationsEn:
      "Hypotension. Taking Viagra/sildenafil or other NO donors. Pregnancy and lactation — insufficient data.",
    sources: [
      "Examine.com — Citrulline",
      "Perez-Guisado 2010",
      "Bendahan 2017",
    ],
    recommendedForGoals: ["cut", "endurance", "strength"],
  },

  // ============================================================
  // RECOVERY (5) — Для восстановления
  // ============================================================

  // 4. Протеин (сывороточный)
  {
    slug: "whey-protein",
    nameRu: "Протеин (сывороточный)",
    nameEn: "Whey protein",
    category: "recovery" as SupplementCategory,
    descriptionRu:
      "Быстроусвояемый белок из молочной сыворотки. Идеален для восстановления после тренировки. Полный аминокислотный профиль, высокий лейцин (анаболический триггер).",
    descriptionEn:
      "Fast-absorbing protein from milk whey. Ideal for post-workout recovery. Complete amino acid profile, high leucine (anabolic trigger).",
    dosageRu:
      "20-40 г на приём. Общее количество белка: 1.6-2.2 г/кг массы тела в день. После тренировки — 30-40 г. Между приёмами пищи — 20-30 г.",
    dosageEn:
      "20-40 g per serving. Total protein: 1.6-2.2 g/kg body weight per day. Post-workout — 30-40 g. Between meals — 20-30 g.",
    timingRu:
      "После тренировки (в течение 1 часа) — оптимально. Утром после пробуждения. Между приёмами пищи для общего количества белка. Можно и перед сном, но казеин лучше.",
    timingEn:
      "After workout (within 1 hour) — optimal. In the morning after waking. Between meals for total protein. Can also be before bed, but casein is better.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Мета-анализ Morton et al. (2018, n=1800) подтвердил: сывороточный протеин + силовые тренировки = +0.5-1 кг сухой массы и +25% прироста силы vs плацебо. ISSN position stand (2017) рекомендует 1.4-2.0 г/кг для атлетов.",
    efficacyNotesEn:
      "Meta-analysis Morton et al. (2018, n=1800) confirmed: whey protein + resistance training = +0.5-1 kg lean mass and +25% strength gain vs placebo. ISSN position stand (2017) recommends 1.4-2.0 g/kg for athletes.",
    sideEffectsRu:
      "Лактозная непереносимость (выбери изолят). Аллергия на белок коровьего молока — редкость. Избыток белка (>3 г/кг) не даёт дополнительных преимуществ и нагружает почки.",
    sideEffectsEn:
      "Lactose intolerance (choose isolate). Allergy to cow's milk protein — rare. Excess protein (>3 g/kg) gives no additional benefit and strains kidneys.",
    contraindicationsRu:
      "Тяжёлые заболевания почек. Аллергия на белок коровьего молока. Фенилкетонурия (содержит фенилаланин).",
    contraindicationsEn:
      "Severe kidney disease. Allergy to cow's milk protein. Phenylketonuria (contains phenylalanine).",
    sources: [
      "ISSN position stand (2017)",
      "ACSM position stand",
      "Morton et al. 2018",
      "Examine.com — Whey protein",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp"],
  },

  // 5. Казеин
  {
    slug: "casein-protein",
    nameRu: "Казеин",
    nameEn: "Casein protein",
    category: "recovery" as SupplementCategory,
    descriptionRu:
      "Медленноусвояемый белок (5-7 часов). Идеален перед сном — обеспечивает антикатаболический эффект всю ночь. Снижает распад мышц на 30% ночью.",
    descriptionEn:
      "Slow-absorbing protein (5-7 hours). Ideal before bed — provides anti-catabolic effect throughout the night. Reduces muscle breakdown by 30% at night.",
    dosageRu:
      "20-40 г перед сном. Можно комбинировать с сывороточным — 1:1. Общее количество белка в рационе должно быть 1.6-2.2 г/кг массы тела в день.",
    dosageEn:
      "20-40 g before bed. Can be combined with whey — 1:1. Total protein in diet should be 1.6-2.2 g/kg body weight per day.",
    timingRu:
      "Перед сном (за 30-60 минут) — основной сценарий. Можно как замену приёма пищи (долго сохраняет сытость). Не рекомендуется сразу после тренировки — слишком медленный.",
    timingEn:
      "Before bed (30-60 minutes) — main scenario. Can be a meal replacement (long satiety). Not recommended immediately after workout — too slow.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Res et al. (2012) показал: 40 г казеина перед сном + силовая тренировка = +25% синтеза мышечного белка ночью vs плацебо. Удобен для атлетов, не успевающих поесть вечером.",
    efficacyNotesEn:
      "Res et al. (2012) showed: 40 g casein before bed + strength training = +25% muscle protein synthesis at night vs placebo. Convenient for athletes who can't eat in the evening.",
    sideEffectsRu:
      "Лактозная непереносимость (хотя казеин содержит меньше лактозы). Аллергия на белок коровьего молока — чаще чем на сыворотку. Тяжесть в желудке при больших дозах.",
    sideEffectsEn:
      "Lactose intolerance (though casein contains less lactose). Cow's milk protein allergy — more common than whey. Stomach heaviness at high doses.",
    contraindicationsRu:
      "Аллергия на белок коровьего молока. Тяжёлые заболевания почек. Фенилкетонурия.",
    contraindicationsEn:
      "Allergy to cow's milk protein. Severe kidney disease. Phenylketonuria.",
    sources: [
      "Examine.com — Casein",
      "Res et al. 2012",
      "ISSN position stand (2017)",
    ],
    recommendedForGoals: ["bulk"],
  },

  // 6. Омега-3
  {
    slug: "omega-3",
    nameRu: "Омега-3 (EPA+DHA)",
    nameEn: "Omega-3 (EPA+DHA)",
    category: "recovery" as SupplementCategory,
    descriptionRu:
      "Полиненасыщенные жирные кислоты. Уменьшают воспаление, поддерживают сердце, мозг, суставы. Большинство людей получают мало омега-3 из пищи.",
    descriptionEn:
      "Polyunsaturated fatty acids. Reduce inflammation, support heart, brain, joints. Most people get too little omega-3 from food.",
    dosageRu:
      "1-3 г EPA+DHA в день (не «рыбьего жира», а именно EPA+DHA — проверь этикетку). Для воспаления/суставов — 2-4 г. С едой, содержащей жир (улучшает усвоение).",
    dosageEn:
      "1-3 g EPA+DHA per day (not «fish oil», but EPA+DHA — check the label). For inflammation/joints — 2-4 g. With food containing fat (improves absorption).",
    timingRu:
      "С едой (лучше с жирной — улучшает усвоение на 30-50%). Время суток не критично. Можно разделить на 2 приёма. Хранить в холодильнике.",
    timingEn:
      "With food (preferably fatty — improves absorption by 30-50%). Time of day not critical. Can be split into 2 doses. Store in refrigerator.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "AHA рекомендует 1 г EPA+DHA для профилактики сердечно-сосудистых заболеваний. Мета-анализ показывает снижение триглицеридов на 25-30%. Для спортсменов — снижение DOMS и воспаления.",
    efficacyNotesEn:
      "AHA recommends 1 g EPA+DHA for cardiovascular disease prevention. Meta-analysis shows 25-30% triglyceride reduction. For athletes — reduced DOMS and inflammation.",
    sideEffectsRu:
      "Рыбная отрыжка (выбери капсулы с энтеросолюбильным покрытием). Разжижение крови (важно при приёме антикоагулянтов). При дозах >3 г — повышенный риск кровотечений.",
    sideEffectsEn:
      "Fishy burps (choose enteric-coated capsules). Blood thinning (important with anticoagulants). At doses >3 g — increased bleeding risk.",
    contraindicationsRu:
      "Приём антикоагулянтов (варфарин, аспирин в больших дозах). Аллергия на рыбу. Перед хирургическими операциями — отменить за 2 недели.",
    contraindicationsEn:
      "Taking anticoagulants (warfarin, high-dose aspirin). Fish allergy. Before surgery — discontinue 2 weeks prior.",
    sources: [
      "American Heart Association (AHA)",
      "Examine.com — Fish oil",
      "ISSN position stand on omega-3",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp", "endurance"],
  },

  // 7. Магний
  {
    slug: "magnesium",
    nameRu: "Магний",
    nameEn: "Magnesium",
    category: "recovery" as SupplementCategory,
    descriptionRu:
      "Минерал, участвующий в >300 биохимических реакциях (включая синтез АТФ и мышечное сокращение). Большинство людей (60-70%) в дефиците. Улучшает сон, снижает судороги.",
    descriptionEn:
      "Mineral involved in >300 biochemical reactions (including ATP synthesis and muscle contraction). Most people (60-70%) are deficient. Improves sleep, reduces cramps.",
    dosageRu:
      "200-400 мг магния в день. Лучшие формы: глицинат (для сна), цитрат (для ЖКТ — лёгкое слабительное), треонат (для мозга). Оксид магния — плохое усвоение (~4%).",
    dosageEn:
      "200-400 mg magnesium per day. Best forms: glycinate (for sleep), citrate (for GI — mild laxative), threonate (for brain). Magnesium oxide — poor absorption (~4%).",
    timingRu:
      "Вечером (за 1-2 часа до сна) — улучшает качество сна. С едой — снижает ЖКТ-дискомфорт. Не одновременно с кальцием и железом (конкуренция за усвоение).",
    timingEn:
      "In the evening (1-2 hours before bed) — improves sleep quality. With food — reduces GI discomfort. Not simultaneously with calcium and iron (absorption competition).",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Мета-анализ Zhang et al. (2019) подтвердил: магний улучшает качество сна (на 8-12%) и снижает время засыпания (на 17%). Nielsen et al. показал снижение мышечных судорог у 80% атлетов в дефиците.",
    efficacyNotesEn:
      "Meta-analysis Zhang et al. (2019) confirmed: magnesium improves sleep quality (by 8-12%) and reduces sleep onset (by 17%). Nielsen et al. showed reduced muscle cramps in 80% of deficient athletes.",
    sideEffectsRu:
      "При больших дозах (>600 мг) — диарея (особенно цитрат). Сонливость (поэтому принимать вечером). Падение артериального давления.",
    sideEffectsEn:
      "At high doses (>600 mg) — diarrhea (especially citrate). Drowsiness (so take in evening). Drop in blood pressure.",
    contraindicationsRu:
      "Тяжёлые заболевания почек (магний выводится почками). Гипотония. AV-блокада сердца. Перед приёмом с антибиотиками (хинолоны, тетрациклины) — интервал 2 часа.",
    contraindicationsEn:
      "Severe kidney disease (magnesium is excreted by kidneys). Hypotension. AV heart block. Before taking with antibiotics (quinolones, tetracyclines) — 2 hour interval.",
    sources: [
      "Examine.com — Magnesium",
      "Zhang et al. 2019 meta-analysis",
      "Nielsen 2006",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp", "endurance"],
  },

  // 8. Цинк
  {
    slug: "zinc",
    nameRu: "Цинк",
    nameEn: "Zinc",
    category: "recovery" as SupplementCategory,
    descriptionRu:
      "Минерал, важный для иммунитета, тестостерона, синтеза белка. Спортсмены теряют цинк с потом. При дефиците — снижение иммунитета, анаболизма, либидо.",
    descriptionEn:
      "Mineral important for immunity, testosterone, protein synthesis. Athletes lose zinc through sweat. Deficiency leads to reduced immunity, anabolism, libido.",
    dosageRu:
      "15-30 мг в день. Лучшие формы: пиколинат, глицинат, бисглицинат. Не более 40 мг/день длительно (длительный приём >50 мг подавляет иммунитет). С едой.",
    dosageEn:
      "15-30 mg per day. Best forms: picolinate, glycinate, bisglycinate. No more than 40 mg/day long-term (long-term >50 mg suppresses immunity). With food.",
    timingRu:
      "Вечером (с едой) — улучшает усвоение. Не одновременно с медью и железом (конкуренция). Если принимаешь железо — раздели на 2 приёма с интервалом 4 часа.",
    timingEn:
      "In the evening (with food) — improves absorption. Not simultaneously with copper and iron (competition). If taking iron — split into 2 doses 4 hours apart.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Prasad et al. (1996) показал: цинк при дефиците повышает тестостерон на 40%. У атлетов с нормальным уровнем — меньший эффект. Снижает продолжительность простуды на 33% (Prasad 2008).",
    efficacyNotesEn:
      "Prasad et al. (1996) showed: zinc in deficiency raises testosterone by 40%. In athletes with normal levels — smaller effect. Reduces cold duration by 33% (Prasad 2008).",
    sideEffectsRu:
      "Тошнота натощак. Металлический привкус. Длительный приём >40 мг/день — дефицит меди (нужно добавлять 1-2 мг меди). Снижение HDL при больших дозах.",
    sideEffectsEn:
      "Nausea on empty stomach. Metallic taste. Long-term use >40 mg/day — copper deficiency (need 1-2 mg copper). Reduced HDL at high doses.",
    contraindicationsRu:
      "Приём антибиотиков (хинолоны, тетрациклины) — интервал 2 часа. Болезнь Вильсона (накопление меди). Тяжёлые заболевания почек.",
    contraindicationsEn:
      "Taking antibiotics (quinolones, tetracyclines) — 2 hour interval. Wilson's disease (copper accumulation). Severe kidney disease.",
    sources: [
      "Examine.com — Zinc",
      "Prasad et al. 1996",
      "Prasad 2008",
    ],
    recommendedForGoals: ["bulk", "recovery"],
  },

  // ============================================================
  // JOINTS (3) — Для суставов
  // ============================================================

  // 9. Коллаген
  {
    slug: "collagen",
    nameRu: "Коллаген (тип I и II)",
    nameEn: "Collagen (type I and II)",
    category: "joints" as SupplementCategory,
    descriptionRu:
      "Структурный белок соединительной ткани (сухожилия, связки, кожа, суставы). Тип I — для сухожилий и кожи, тип II — для суставного хряща. Особенно важен для атлетов с нагрузкой на суставы.",
    descriptionEn:
      "Structural protein of connective tissue (tendons, ligaments, skin, joints). Type I — for tendons and skin, type II — for articular cartilage. Especially important for athletes with joint stress.",
    dosageRu:
      "10-15 г гидролизованного коллагена в день. Для суставов — 10 г/день в течение 3-6 месяцев (эффект накопительный). С витамином С (50-100 мг) — улучшает синтез коллагена.",
    dosageEn:
      "10-15 g hydrolyzed collagen per day. For joints — 10 g/day for 3-6 months (cumulative effect). With vitamin C (50-100 mg) — improves collagen synthesis.",
    timingRu:
      "За 30-60 минут до тренировки — лучше усваивается в сухожилиях. Натощак — улучшает усвоение аминокислот. С витамином С — критично для синтеза.",
    timingEn:
      "30-60 minutes before workout — better absorbed in tendons. On empty stomach — improves amino acid absorption. With vitamin C — critical for synthesis.",
    efficacy: "mixed" as SupplementEfficacy,
    efficacyNotesRu:
      "Baar (2017) показал улучшение здоровья сухожилий при 15 г/день + витамин С. McAlindon et al. (2011) показал снижение боли в коленях на 24-37% через 6 месяцев. Однако другие исследования не показывают эффекта. Вероятно, работает при длительном приёме.",
    efficacyNotesEn:
      "Baar (2017) showed improved tendon health at 15 g/day + vitamin C. McAlindon et al. (2011) showed 24-37% knee pain reduction over 6 months. However, other studies show no effect. Likely works with long-term intake.",
    sideEffectsRu:
      "Редко — лёгкие ЖКТ-проблемы. Аллергия на морепродукты (если коллаген рыбий). Ощущение тяжести в желудке при больших дозах.",
    sideEffectsEn:
      "Rarely — mild GI issues. Seafood allergy (if collagen is fish-derived). Stomach heaviness at high doses.",
    contraindicationsRu:
      "Аллергия на источник коллагена (рыба, говядина, курица). Тяжёлые заболевания почек (высокий белок). Перед хирургическими операциями — консультация.",
    contraindicationsEn:
      "Allergy to collagen source (fish, beef, chicken). Severe kidney disease (high protein). Before surgery — consultation.",
    sources: [
      "Examine.com — Collagen",
      "Baar 2017",
      "McAlindon et al. 2011",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp", "endurance"],
  },

  // 10. Глюкозамин
  {
    slug: "glucosamine",
    nameRu: "Глюкозамин",
    nameEn: "Glucosamine",
    category: "joints" as SupplementCategory,
    descriptionRu:
      "Аминомоносахарид, компонент хряща и синовиальной жидкости. Используется при остеоартрите. Спорные данные по эффективности — зависит от пациента и формы.",
    descriptionEn:
      "Aminosaccharide, component of cartilage and synovial fluid. Used for osteoarthritis. Conflicting efficacy data — depends on patient and form.",
    dosageRu:
      "1500 мг в день (сульфат глюкозамина — лучше гидрохлорида). Можно разделить на 2-3 приёма или принять всё сразу. Минимум 3 месяца для оценки эффекта.",
    dosageEn:
      "1500 mg per day (glucosamine sulfate — better than hydrochloride). Can be split into 2-3 doses or taken all at once. Minimum 3 months to assess effect.",
    timingRu:
      "С едой (снижает ЖКТ-дискомфорт). Время суток не критично. Эффект накопительный — 4-12 недель.",
    timingEn:
      "With food (reduces GI discomfort). Time of day not critical. Cumulative effect — 4-12 weeks.",
    efficacy: "mixed" as SupplementEfficacy,
    efficacyNotesRu:
      "GAIT исследование (2006, n=1583) — глюкозамин не лучше плацебо для общего остеоартрита, но эффективен для подгруппы с умеренной болью. Мета-анализ Wu et al. (2013) показал небольшое снижение боли. Не работает при тяжёлом остеоартрите.",
    efficacyNotesEn:
      "GAIT study (2006, n=1583) — glucosamine no better than placebo for general osteoarthritis, but effective for subgroup with moderate pain. Meta-analysis Wu et al. (2013) showed small pain reduction. Does not work for severe osteoarthritis.",
    sideEffectsRu:
      "Редко — лёгкие ЖКТ-проблемы (тошнота, изжога). Головная боль. Аллергическая реакция у людей с аллергией на моллюсков (если sourced from shells).",
    sideEffectsEn:
      "Rarely — mild GI issues (nausea, heartburn). Headache. Allergic reaction in people with shellfish allergy (if sourced from shells).",
    contraindicationsRu:
      "Аллергия на моллюсков (если из раковин). Беременность и лактация — недостаточно данных. Диабет (может влиять на сахар — контролировать). Приём варфарина — повышает антикоагулянтный эффект.",
    contraindicationsEn:
      "Shellfish allergy (if from shells). Pregnancy and lactation — insufficient data. Diabetes (may affect sugar — monitor). Taking warfarin — enhances anticoagulant effect.",
    sources: [
      "Examine.com — Glucosamine",
      "GAIT study 2006",
      "Wu et al. 2013 meta-analysis",
    ],
    recommendedForGoals: ["recovery"],
  },

  // 11. MSM
  {
    slug: "msm",
    nameRu: "MSM (метилсульфонилметан)",
    nameEn: "MSM (methylsulfonylmethane)",
    category: "joints" as SupplementCategory,
    descriptionRu:
      "Органическая сера, важна для синтеза коллагена и хряща. Используется при остеоартрите и воспалении. Часто комбинируется с глюкозамином и хондроитином.",
    descriptionEn:
      "Organic sulfur, important for collagen and cartilage synthesis. Used for osteoarthritis and inflammation. Often combined with glucosamine and chondroitin.",
    dosageRu:
      "1000-3000 мг в день. Начинать с 1000 мг и повышать. Можно разделить на 2 приёма. Минимум 12 недель для оценки эффекта.",
    dosageEn:
      "1000-3000 mg per day. Start with 1000 mg and increase. Can be split into 2 doses. Minimum 12 weeks to assess effect.",
    timingRu:
      "С едой (снижает ЖКТ-дискомфорт). Время суток не критично. Утром — если тонизирующий эффект, вечером — если расслабляющий.",
    timingEn:
      "With food (reduces GI discomfort). Time of day not critical. In the morning — if stimulating effect, in the evening — if relaxing.",
    efficacy: "mixed" as SupplementEfficacy,
    efficacyNotesRu:
      "Kim et al. (2006, n=50) показал снижение боли в коленях на 25% через 12 недель. Но Mockabee-Matos et al. (2017) не подтвердил значимого эффекта. Может работать в комбинации с глюкозамином + хондроитином.",
    efficacyNotesEn:
      "Kim et al. (2006, n=50) showed 25% knee pain reduction over 12 weeks. But Mockabee-Matos et al. (2017) did not confirm significant effect. May work in combination with glucosamine + chondroitin.",
    sideEffectsRu:
      "Редко — лёгкие ЖКТ-проблемы (тошнота, диарея). Головная боль. Тонизирующий эффект при больших дозах — может мешать сну.",
    sideEffectsEn:
      "Rarely — mild GI issues (nausea, diarrhea). Headache. Stimulating effect at high doses — may disrupt sleep.",
    contraindicationsRu:
      "Беременность и лактация — недостаточно данных. Приём антикоагулянтов — повышает риск кровотечений. Гиперчувствительность к сере (редко).",
    contraindicationsEn:
      "Pregnancy and lactation — insufficient data. Taking anticoagulants — increases bleeding risk. Hypersensitivity to sulfur (rare).",
    sources: [
      "Examine.com — MSM",
      "Kim et al. 2006",
      "Mockabee-Matos et al. 2017",
    ],
    recommendedForGoals: ["recovery"],
  },

  // ============================================================
  // ENERGY/CNS (3) — Для энергии/ЦНС
  // ============================================================

  // 12. Кофеин
  {
    slug: "caffeine",
    nameRu: "Кофеин",
    nameEn: "Caffeine",
    category: "energy" as SupplementCategory,
    descriptionRu:
      "Самый изученный стимулятор ЦНС. Блокирует аденозиновые рецепторы, повышает бдительность, фокус, силу. Улучшает спортивные показатели на 2-5%.",
    descriptionEn:
      "The most studied CNS stimulant. Blocks adenosine receptors, increases alertness, focus, strength. Improves athletic performance by 2-5%.",
    dosageRu:
      "3-6 мг/кг массы тела (для 70 кг — 210-420 мг). Не более 400 мг/день (безопасный предел FDA). Чувствительность индивидуальна — начни с 2-3 мг/кг. Толерантность развивается.",
    dosageEn:
      "3-6 mg/kg body weight (for 70 kg — 210-420 mg). No more than 400 mg/day (FDA safe limit). Individual sensitivity — start with 2-3 mg/kg. Tolerance develops.",
    timingRu:
      "30-60 минут до тренировки — пик в крови. Эффект длится 4-6 часов. Не принимать после 14:00 — нарушит сон (период полураспада 5-6 часов).",
    timingEn:
      "30-60 minutes before workout — peak in blood. Effect lasts 4-6 hours. Don't take after 2 PM — will disrupt sleep (half-life 5-6 hours).",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "ISSN position stand (2021) подтверждает: 3-6 мг/кг повышает выносливость на 2-5%, силу на 2-7%. Эффект доказан в >100 мета-анализах. Особенно эффективен для эндуранса и взрывной силы.",
    efficacyNotesEn:
      "ISSN position stand (2021) confirms: 3-6 mg/kg improves endurance by 2-5%, strength by 2-7%. Effect proven in >100 meta-analyses. Especially effective for endurance and explosive strength.",
    sideEffectsRu:
      "Бессонница (при приёме поздно вечером). Тревожность, раздражительность. Толерантность — нужно повышать дозу. Зависимость — синдром отмены (головная боль, усталость). Тахикардия при больших дозах.",
    sideEffectsEn:
      "Insomnia (when taken late evening). Anxiety, irritability. Tolerance — need to increase dose. Dependence — withdrawal syndrome (headache, fatigue). Tachycardia at high doses.",
    contraindicationsRu:
      "Тяжёлая гипертония. Аритмии. Тревожные расстройства. Беременность (ограничить до 200 мг/день). Язвенная болезнь желудка. Приём теофиллина — усиливает токсичность.",
    contraindicationsEn:
      "Severe hypertension. Arrhythmias. Anxiety disorders. Pregnancy (limit to 200 mg/day). Peptic ulcer. Taking theophylline — enhances toxicity.",
    sources: [
      "ISSN position stand (2021)",
      "Examine.com — Caffeine",
      "McLellan et al. 2016",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp", "endurance"],
  },

  // 13. L-теанин
  {
    slug: "l-theanine",
    nameRu: "L-теанин",
    nameEn: "L-theanine",
    category: "energy" as SupplementCategory,
    descriptionRu:
      "Аминокислота из зелёного чая. Снижает тревожность, повышает альфа-волны мозга. Синергия с кофеином — фокус без «кофеиновой дрожи». Эффективен для спокойной концентрации.",
    descriptionEn:
      "Amino acid from green tea. Reduces anxiety, increases brain alpha waves. Synergy with caffeine — focus without «caffeine jitters». Effective for calm concentration.",
    dosageRu:
      "100-200 мг с кофеином (соотношение 2:1 с кофеином). Для сна — 200 мг за 1 час до сна. Можно принимать ежедневно, толерантности нет.",
    dosageEn:
      "100-200 mg with caffeine (2:1 ratio with caffeine). For sleep — 200 mg 1 hour before bed. Can be taken daily, no tolerance.",
    timingRu:
      "С кофеином (30-60 мин до тренировки или работы). Перед сном (200 мг) — улучшает качество сна. Утром — для спокойного фокуса.",
    timingEn:
      "With caffeine (30-60 min before workout or work). Before bed (200 mg) — improves sleep quality. In the morning — for calm focus.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Haskell et al. (2008) показал: L-теанин + кофеин улучшают фокус и время реакции лучше, чем плацебо. Dodd et al. (2015) подтвердил синергию 2:1. Для сна — Lovallo et al. (2012) показал улучшение качества сна у людей с тревожностью.",
    efficacyNotesEn:
      "Haskell et al. (2008) showed: L-theanine + caffeine improves focus and reaction time better than placebo. Dodd et al. (2015) confirmed 2:1 synergy. For sleep — Lovallo et al. (2012) showed improved sleep quality in people with anxiety.",
    sideEffectsRu:
      "Очень редко — лёгкая сонливость. Головокружение при больших дозах (>400 мг). Безопасен даже при 1200 мг/день. Не вызывает зависимости.",
    sideEffectsEn:
      "Very rarely — mild drowsiness. Dizziness at high doses (>400 mg). Safe even at 1200 mg/day. Non-addictive.",
    contraindicationsRu:
      "Приём стимуляторов ЦНС (взаимодействие). Приём антигипертензивных (может снижать давление). Беременность и лактация — недостаточно данных.",
    contraindicationsEn:
      "Taking CNS stimulants (interaction). Taking antihypertensives (may lower blood pressure). Pregnancy and lactation — insufficient data.",
    sources: [
      "Examine.com — L-theanine",
      "Haskell et al. 2008",
      "Dodd et al. 2015",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp", "endurance"],
  },

  // 14. Ашваганда
  {
    slug: "ashwagandha",
    nameRu: "Ашваганда (Withania somnifera)",
    nameEn: "Ashwagandha (Withania somnifera)",
    category: "energy" as SupplementCategory,
    descriptionRu:
      "Адаптоген из аюрведической медицины. Снижает кортизол (на 20-30%), повышает тестостерон, улучшает сон, снижает стресс. Экстракт KSM-66 — стандарт.",
    descriptionEn:
      "Adaptogen from Ayurvedic medicine. Reduces cortisol (by 20-30%), increases testosterone, improves sleep, reduces stress. KSM-66 extract is the standard.",
    dosageRu:
      "300-600 мг экстракта KSM-66 в день. Можно разделить на 2 приёма (утро/вечер). Минимум 4-8 недель для полного эффекта. Не превышать 1500 мг/день.",
    dosageEn:
      "300-600 mg KSM-66 extract per day. Can be split into 2 doses (morning/evening). Minimum 4-8 weeks for full effect. Do not exceed 1500 mg/day.",
    timingRu:
      "Утром и вечером. Если 1 раз в день — вечером (улучшает сон). С едой — снижает ЖКТ-дискомфорт. Циклы: 2-3 месяца приёма, 2-4 недели перерыв.",
    timingEn:
      "Morning and evening. If once a day — in the evening (improves sleep). With food — reduces GI discomfort. Cycles: 2-3 months on, 2-4 weeks off.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Chandrasekhar et al. (2012) — снижение кортизола на 27.9% за 60 дней. Lopresti et al. (2019) подтвердил снижение тревожности на 14-26%. Для спортсменов — Wankhede et al. (2015) показал рост тестостерона на 15% и силы на 8%.",
    efficacyNotesEn:
      "Chandrasekhar et al. (2012) — 27.9% cortisol reduction over 60 days. Lopresti et al. (2019) confirmed 14-26% anxiety reduction. For athletes — Wankhede et al. (2015) showed 15% testosterone increase and 8% strength gain.",
    sideEffectsRu:
      "Редко — лёгкие ЖКТ-проблемы. Сонливость при больших дозах. Повышение тиреоидных гормонов (проблема при гипертиреозе). Не принимать натощак.",
    sideEffectsEn:
      "Rarely — mild GI issues. Drowsiness at high doses. Increased thyroid hormones (problem with hyperthyroidism). Do not take on empty stomach.",
    contraindicationsRu:
      "Гипертиреоз. Аутоиммунные заболевания (может стимулировать иммунитет). Беременность и лактация. Приём седативных, антидепрессантов, иммунодепрессантов — консультация врача.",
    contraindicationsEn:
      "Hyperthyroidism. Autoimmune conditions (may stimulate immunity). Pregnancy and lactation. Taking sedatives, antidepressants, immunosuppressants — consult a doctor.",
    sources: [
      "Examine.com — Ashwagandha",
      "Chandrasekhar et al. 2012",
      "Wankhede et al. 2015",
      "Lopresti et al. 2019",
    ],
    recommendedForGoals: ["recovery", "bulk"],
  },

  // ============================================================
  // SLEEP (2) — Для сна
  // ============================================================

  // 15. Мелатонин
  {
    slug: "melatonin",
    nameRu: "Мелатонин",
    nameEn: "Melatonin",
    category: "sleep" as SupplementCategory,
    descriptionRu:
      "Гормон эпифиза, регулирует циркадные ритмы. Эффективен при джетлаге, смене графика, бессоннице. Безопасен, не вызывает зависимости.",
    descriptionEn:
      "Pineal gland hormone, regulates circadian rhythms. Effective for jet lag, shift work, insomnia. Safe, non-addictive.",
    dosageRu:
      "0.3-3 мг за 30 минут до сна. Больше — не лучше: дозы >5 мг часто вызывают «туман в голове» утром. Начни с минимальной эффективной дозы.",
    dosageEn:
      "0.3-3 mg 30 minutes before bed. More is not better: doses >5 mg often cause «brain fog» in the morning. Start with the minimum effective dose.",
    timingRu:
      "За 30-60 минут до желаемого сна. В тёмное время суток (свет разрушает эффект). Не за 2+ часа до сна (носовой пик слишком ранний).",
    timingEn:
      "30-60 minutes before desired sleep. In darkness (light destroys the effect). Not 2+ hours before sleep (nasal peak too early).",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Cochrane review (2018) подтвердил эффективность при джетлаге (5 мг перед сном в новой временной зоне). Мета-анализ Ferracioli et al. (2019) показал снижение времени засыпания на 7-12 минут. Для хронической бессонницы эффект слабее.",
    efficacyNotesEn:
      "Cochrane review (2018) confirmed efficacy for jet lag (5 mg before bed in new time zone). Meta-analysis Ferraccioli et al. (2019) showed 7-12 minute reduction in sleep onset. For chronic insomnia, weaker effect.",
    sideEffectsRu:
      "Утренняя сонливость (особенно при больших дозах). Яркие сны (бывает). Головная боль. Длительный приём — снижение собственной выработки (спорно).",
    sideEffectsEn:
      "Morning drowsiness (especially at high doses). Vivid dreams (sometimes). Headache. Long-term use — reduced endogenous production (debated).",
    contraindicationsRu:
      "Аутоиммунные заболевания (мелатонин может стимулировать иммунитет). Беременность и лактация. Приём антикоагулянтов. Эпилепсия (может снижать порог судорог).",
    contraindicationsEn:
      "Autoimmune diseases (melatonin may stimulate immunity). Pregnancy and lactation. Taking anticoagulants. Epilepsy (may lower seizure threshold).",
    sources: [
      "Examine.com — Melatonin",
      "Cochrane review 2018",
      "Ferracioli et al. 2019",
    ],
    recommendedForGoals: ["recovery"],
  },

  // 16. Магний-глицинат
  {
    slug: "magnesium-glycinate",
    nameRu: "Магний-глицинат",
    nameEn: "Magnesium glycinate",
    category: "sleep" as SupplementCategory,
    descriptionRu:
      "Хелатная форма магния (магний + глицин). Высокая биодоступность, минимальный ЖКТ-дискомфорт. Глицин — тормозной нейромедиатор, улучшает сон.",
    descriptionEn:
      "Chelated form of magnesium (magnesium + glycine). High bioavailability, minimal GI discomfort. Glycine is an inhibitory neurotransmitter, improves sleep.",
    dosageRu:
      "200-400 мг магния (или 1000-2000 мг магний-глицината — проверь этикетку по содержанию элементарного магния). За 1 час до сна.",
    dosageEn:
      "200-400 mg magnesium (or 1000-2000 mg magnesium glycinate — check the label for elemental magnesium content). 1 hour before bed.",
    timingRu:
      "За 1 час до сна — основное время. Можно разделить на 2 приёма (вечером + перед сном). С едой — улучшает усвоение.",
    timingEn:
      "1 hour before bed — main timing. Can be split into 2 doses (evening + before bed). With food — improves absorption.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Abbasi et al. (2012, n=46) — 500 мг магния вечером улучшали время засыпания, EFFICIENCY сна на 16%, мелатонин в крови. Глицин отдельно показал улучшение сна (Yamadera et al. 2007). Синергия магний + глицин — двойной эффект.",
    efficacyNotesEn:
      "Abbasi et al. (2012, n=46) — 500 mg magnesium in the evening improved sleep onset, sleep efficiency by 16%, blood melatonin. Glycine separately showed improved sleep (Yamadera et al. 2007). Magnesium + glycine synergy — double effect.",
    sideEffectsRu:
      "Редко — лёгкая сонливость (это и есть эффект). При больших дозах — диарея (но глицинат реже вызывает, чем цитрат).",
    sideEffectsEn:
      "Rarely — mild drowsiness (which is the effect). At high doses — diarrhea (but glycinate is less likely than citrate).",
    contraindicationsRu:
      "Тяжёлые заболевания почек. Гипотония. AV-блокада сердца. Приём леводопы (снижает эффект) — интервал 2 часа.",
    contraindicationsEn:
      "Severe kidney disease. Hypotension. AV heart block. Taking levodopa (reduces effect) — 2 hour interval.",
    sources: [
      "Examine.com — Magnesium",
      "Abbasi et al. 2012",
      "Yamadera et al. 2007",
    ],
    recommendedForGoals: ["recovery"],
  },

  // ============================================================
  // VITAMINS (2) — Витамины
  // ============================================================

  // 17. Витамин D3 + K2
  {
    slug: "vitamin-d3-k2",
    nameRu: "Витамин D3 + K2",
    nameEn: "Vitamin D3 + K2",
    category: "vitamins" as SupplementCategory,
    descriptionRu:
      "Витамин D3 — гормон, важный для костей, иммунитета, тестостерона, мышечной силы. K2 направляет кальций в кости (а не в сосуды). Большинство людей в дефиците, особенно зимой.",
    descriptionEn:
      "Vitamin D3 — hormone important for bones, immunity, testosterone, muscle strength. K2 directs calcium into bones (not vessels). Most people are deficient, especially in winter.",
    dosageRu:
      "1000-4000 IU D3 в день. Лучше — проверить уровень 25(OH)D в крови (норма 30-50 нг/мл). K2 (MK-7) — 100-200 мкг/день. С жирной едой (жирорастворимый).",
    dosageEn:
      "1000-4000 IU D3 per day. Better — check 25(OH)D level in blood (normal 30-50 ng/ml). K2 (MK-7) — 100-200 mcg/day. With fatty food (fat-soluble).",
    timingRu:
      "Утром или в обед (вечером может мешать сну — подавляет мелатонин). С жирной едой (авокадо, орехи, масло) — улучшает усвоение на 30-50%. K2 вместе с D3.",
    timingEn:
      "Morning or lunch (in evening may disrupt sleep — suppresses melatonin). With fatty food (avocado, nuts, butter) — improves absorption by 30-50%. K2 together with D3.",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "Endocrine Society рекомендует 1500-2000 IU D3/день для поддержания уровня 30 нг/мл. Мета-анализ (2019) показал снижение респираторных инфекций на 12%. Для атлетов — Ceglia et al. (2008) показал улучшение силы при дозе 4000 IU/день у дефицитных.",
    efficacyNotesEn:
      "Endocrine Society recommends 1500-2000 IU D3/day to maintain 30 ng/ml. Meta-analysis (2019) showed 12% reduction in respiratory infections. For athletes — Ceglia et al. (2008) showed strength improvement at 4000 IU/day in deficient individuals.",
    sideEffectsRu:
      "При длительном приёме >10000 IU/день — гиперкальциемия (тошнота, слабость, камни в почках). Гиперкальциурия. K2 минимизирует этот риск, направляя кальций в кости.",
    sideEffectsEn:
      "With long-term use >10000 IU/day — hypercalcemia (nausea, weakness, kidney stones). Hypercalciuria. K2 minimizes this risk by directing calcium into bones.",
    contraindicationsRu:
      "Гиперкальциемия. Саркоидоз. Первичный гиперпаратиреоз. Туберкулёз (активный). Приём тиазидных диуретиков — повышает кальций.",
    contraindicationsEn:
      "Hypercalcemia. Sarcoidosis. Primary hyperparathyroidism. Active tuberculosis. Taking thiazide diuretics — increases calcium.",
    sources: [
      "Endocrine Society guidelines",
      "Examine.com — Vitamin D",
      "Ceglia et al. 2008",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp", "endurance"],
  },

  // 18. B-комплекс
  {
    slug: "b-complex",
    nameRu: "B-комплекс",
    nameEn: "B-complex",
    category: "vitamins" as SupplementCategory,
    descriptionRu:
      "Группа из 8 витаминов (B1, B2, B3, B5, B6, B7, B9, B12). Важны для энергии, нервной системы, синтеза нейромедиаторов. Веганы особенно нуждаются в B12.",
    descriptionEn:
      "Group of 8 vitamins (B1, B2, B3, B5, B6, B7, B9, B12). Important for energy, nervous system, neurotransmitter synthesis. Vegans especially need B12.",
    dosageRu:
      "Согласно инструкции производителя. Стандартная доза: 100% DV каждого витамина B. B12 — 1000 мкг/день для веганов (сублингвально). Не превышать рекомендации.",
    dosageEn:
      "According to manufacturer's instructions. Standard dose: 100% DV of each B vitamin. B12 — 1000 mcg/day for vegans (sublingual). Do not exceed recommendations.",
    timingRu:
      "Утром с едой (стимулирует энергию, мешает сну). Не вечером — B12 может нарушить сон. С жирной едой — улучшает усвоение B1, B2, A, E (жирорастворимые).",
    timingEn:
      "In the morning with food (stimulates energy, disrupts sleep). Not in the evening — B12 may disrupt sleep. With fatty food — improves absorption of B1, B2, A, E (fat-soluble).",
    efficacy: "validated" as SupplementEfficacy,
    efficacyNotesRu:
      "При дефиците — явный эффект (энергия, фокус). При нормальном уровне — эффект отсутствует. B12 для веганов критичен (дефицит развивается за 1-3 года). Фолиевая кислота (B9) важна для беременных (профилактика дефектов нервной трубки).",
    efficacyNotesEn:
      "With deficiency — clear effect (energy, focus). With normal levels — no effect. B12 for vegans is critical (deficiency develops in 1-3 years). Folic acid (B9) is important for pregnant women (neural tube defect prevention).",
    sideEffectsRu:
      "Ярко-жёлтая моча (B2 — нормально). При больших дозах B3 — прилив крови к коже (flushing, не опасно). Длительный приём B6 >100 мг/день — нейропатия.",
    sideEffectsEn:
      "Bright yellow urine (B2 — normal). At high doses of B3 — skin flushing (not dangerous). Long-term B6 use >100 mg/day — neuropathy.",
    contraindicationsRu:
      "Гемохроматоз (B12 повышает усвоение железа). Перед хирургическими операциями — отменить B-комплекс (B7 искажает лабораторные тесты щитовидки).",
    contraindicationsEn:
      "Hemochromatosis (B12 increases iron absorption). Before surgery — discontinue B-complex (B7 distorts thyroid lab tests).",
    sources: [
      "Examine.com — B vitamins",
      "NIH Office of Dietary Supplements",
      "Institute of Medicine (IOM) recommendations",
    ],
    recommendedForGoals: ["bulk", "cut", "recomp", "endurance"],
  },
];
