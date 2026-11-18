// Seed: каталог типичных проблемных зон калистеника (Phase 3).
// Для каждой проблемы: причины, решения, упражнения, техники, питание, врач.
// Структура соответствует типу ProblemArea из lib/types.ts (без id).

import type { ProblemArea, ProblemCategory } from "@/lib/types";

export const PROBLEM_AREAS: Omit<ProblemArea, "id">[] = [
  // ============================================================
  // 1. Жир внизу живота
  // ============================================================
  {
    slug: "stubborn-lower-belly-fat",
    nameRu: "Не уходит жир внизу живота",
    nameEn: "Stubborn lower belly fat",
    descriptionRu:
      "Жировые отложения в нижней части живота, которые не уходят при общем дефиците калорий. Типичная проблема у мужчин и женщин с генетической предрасположенностью и высоким кортизолом.",
    descriptionEn:
      "Fat deposits in the lower belly that do not go away with an overall calorie deficit. A typical problem for men and women with genetic predisposition and high cortisol.",
    category: "fat-loss" as ProblemCategory,
    causesRu: [
      "Недостаточный дефицит калорий — слишком маленькая разница между приходом и расходом",
      "Генетическая предрасположенность: организм запасает жир именно внизу живота",
      "Хронический стресс повышает кортизол, который способствует накоплению висцерального жира",
      "Недостаток сна (менее 7 часов) нарушает лептин/грелин и усиливает тягу к сладкому",
      "Избыток сахара и быстрых углеводов в рационе",
    ],
    causesEn: [
      "Insufficient calorie deficit — too small a gap between intake and expenditure",
      "Genetic predisposition: the body stores fat specifically in the lower belly",
      "Chronic stress raises cortisol, which promotes visceral fat accumulation",
      "Lack of sleep (less than 7 hours) disrupts leptin/ghrelin and increases sugar cravings",
      "Excess sugar and fast carbs in the diet",
    ],
    solutionsRu: [
      "Увеличь дефицит на 100-200 ккал в день (не ниже базового обмена)",
      "ВИИТ-тренировки 3 раза в неделю по 15-20 минут — дают максимальный EPOC-эффект",
      "Силовые тренировки 2-3 раза в неделю для роста мышечной массы и ускорения метаболизма",
      "Сон 7-8 часов: низкий кортизол = меньше жира на животе",
      "Управление стрессом: дыхательные практики, медитация, прогулки на природе",
      "Увеличь NEAT (бытовая активность): 8000-10000 шагов в день",
    ],
    solutionsEn: [
      "Increase the deficit by 100-200 kcal per day (do not drop below BMR)",
      "HIIT workouts 3 times per week for 15-20 minutes — maximum EPOC effect",
      "Strength training 2-3 times per week to build muscle mass and boost metabolism",
      "Sleep 7-8 hours: low cortisol = less belly fat",
      "Stress management: breathing practices, meditation, walks in nature",
      "Increase NEAT (non-exercise activity): 8000-10000 steps per day",
    ],
    recommendedExerciseSlugs: ["burpee", "jump-squat", "pushup-tyson", "plank"],
    recommendedTechniqueSlugs: ["square-breathing", "jacobson-progressive-relaxation"],
    nutritionTipsRu:
      "Дефицит 300-500 ккал от поддерживающего уровня. Белок 2.0-2.5 г/кг массы тела для сохранения мышц. Ограничь сахар до 25 г в день. Ешь больше клетчатки (овощи, ягоды). Углеводы — сложные (гречка, овсянка, бурый рис).",
    nutritionTipsEn:
      "Deficit of 300-500 kcal from maintenance. Protein 2.0-2.5 g/kg body weight to preserve muscle. Limit sugar to 25 g per day. Eat more fiber (vegetables, berries). Carbs — complex (buckwheat, oats, brown rice).",
    whenToSeeDoctorRu:
      "Если живот растёт при дефиците калорий, есть фиолетовые стрии (растяжки), лицо становится луноподобным — проверить кортизол (синдром Кушинга). Также проверить щитовидку (ТТГ, Т3, Т4) и половые гормоны.",
    whenToSeeDoctorEn:
      "If the belly grows despite a calorie deficit, purple striae appear, the face becomes moon-shaped — check cortisol (Cushing's syndrome). Also check thyroid (TSH, T3, T4) and sex hormones.",
    relatedInjuryBodyParts: [],
  },

  // ============================================================
  // 2. Слабый хват
  // ============================================================
  {
    slug: "weak-grip",
    nameRu: "Слабый хват (не держусь на перекладине)",
    nameEn: "Weak grip (cannot hold on the bar)",
    descriptionRu:
      "Не удаётся удержаться на перекладине достаточно долго для тренировки подтягиваний. Хват «слетает» раньше, чем устают мышцы спины.",
    descriptionEn:
      "Cannot hold on to the bar long enough for pull-up training. Grip fails before the back muscles fatigue.",
    category: "strength" as ProblemCategory,
    causesRu: [
      "Недостаточная сила предплечий и мышц-сгибателей пальцев",
      "Ладони потеют — нет трения между кожей и перекладиной",
      "Хват не тренируется целенаправленно, только косвенно через подтягивания",
      "Короткие пальцы или анатомические особенности",
    ],
    causesEn: [
      "Insufficient forearm and finger flexor strength",
      "Sweaty palms — no friction between skin and bar",
      "Grip is not trained specifically, only indirectly through pull-ups",
      "Short fingers or anatomical features",
    ],
    solutionsRu: [
      "Dead hangs: 3-4 подхода на максимум, добавляй по 5 секунд каждую неделю",
      "Fat grip training: оберни перекладину полотенцем или используй толстый гриф",
      "Towel pull-ups: накинь полотенце на перекладину и подтягивайся, держась за концы",
      "Fingerboard / hangboard тренировки (продвинутый уровень)",
      "Wrist curls и reverse wrist curls с гантелями или бутылками воды",
      "Магнезия для подсушивания ладоней (спортивная)",
    ],
    solutionsEn: [
      "Dead hangs: 3-4 sets to maximum, add 5 seconds each week",
      "Fat grip training: wrap a towel around the bar or use a thick bar",
      "Towel pull-ups: drape a towel over the bar and pull up holding the ends",
      "Fingerboard / hangboard training (advanced)",
      "Wrist curls and reverse wrist curls with dumbbells or water bottles",
      "Chalk for drying palms (sports chalk)",
    ],
    recommendedExerciseSlugs: ["pullup-australian", "pullup-classic"],
    recommendedTechniqueSlugs: ["tactile-anchoring"],
    nutritionTipsRu:
      "Специального питания нет. Убедись, что получаешь достаточно белка (1.6-2.2 г/кг) для восстановления предплечий. Магний (400 мг/день) помогает нервно-мышечной передаче.",
    nutritionTipsEn:
      "No specific nutrition. Make sure you get enough protein (1.6-2.2 g/kg) for forearm recovery. Magnesium (400 mg/day) supports neuromuscular transmission.",
    whenToSeeDoctorRu:
      "Если есть боли в запястье, онемение пальцев (особенно большого, указательного, среднего), слабость при хватании предметов — проверить на туннельный синдром (карпальный туннель). Также при синдроме запястного канала нужен невролог.",
    whenToSeeDoctorEn:
      "If you have wrist pain, finger numbness (especially thumb, index, middle), weakness when gripping objects — check for carpal tunnel syndrome. Also a neurologist for wrist tunnel issues.",
    relatedInjuryBodyParts: ["leftWrist", "rightWrist"],
  },

  // ============================================================
  // 3. Плато в подтягиваниях
  // ============================================================
  {
    slug: "pullup-plateau",
    nameRu: "Нет прогресса в подтягиваниях",
    nameEn: "No progress in pull-ups",
    descriptionRu:
      "Количество подтягиваний «залипло» на одном значении и не растёт неделями или месяцами, несмотря на регулярные тренировки.",
    descriptionEn:
      "Pull-up count is stuck at one number and does not grow for weeks or months despite regular training.",
    category: "strength" as ProblemCategory,
    causesRu: [
      "Перетренированность: мышцы и ЦНС не успевают восстанавливаться",
      "Недостаточный объём: мало подходов в неделю для адаптации",
      "Плохая техника: раскачка, неполная амплитуда, рывки",
      "Однообразие: тот же хват, тот же диапазон, тот же подход",
      "Недостаток белка или сна — нет «строительного материала» для адаптации",
    ],
    causesEn: [
      "Overtraining: muscles and CNS do not recover",
      "Insufficient volume: too few sets per week for adaptation",
      "Poor technique: kipping, partial range of motion, jerking",
      "Monotony: same grip, same range, same approach",
      "Lack of protein or sleep — no building material for adaptation",
    ],
    solutionsRu: [
      "Grease-the-groove: 5-6 микро-подходов по 50% от максимума в течение дня, 5 дней в неделю",
      "Негативные повторения: прыжок наверх, медленное опускание 5-10 секунд, 3-5 подходов",
      "Weighted pull-ups: добавь вес 5-10% массы тела, 3-5 подходов по 3-5 повторений",
      "Разнообразие хватов: широкий, узкий, обратный, нейтральный — каждая тренировка",
      "Делай разгрузочную неделю (deload) каждые 4-6 недель: объём -50%",
      "Убедись, что делаешь минимум 10-15 чистых подходов в неделю",
    ],
    solutionsEn: [
      "Grease-the-groove: 5-6 micro-sets at 50% of max throughout the day, 5 days a week",
      "Negative reps: jump up, slow lower for 5-10 seconds, 3-5 sets",
      "Weighted pull-ups: add 5-10% body weight, 3-5 sets of 3-5 reps",
      "Grip variety: wide, narrow, underhand, neutral — each workout",
      "Take a deload week every 4-6 weeks: volume -50%",
      "Make sure you do at least 10-15 clean sets per week",
    ],
    recommendedExerciseSlugs: ["pullup-classic", "pullup-chin", "pullup-archer"],
    recommendedTechniqueSlugs: [
      "principle-of-individuality",
      "micro-victories",
      "progress-journal",
    ],
    nutritionTipsRu:
      "Белок 1.8-2.2 г/кг массы тела. Углеводы перед тренировкой (за 1-2 часа) для гликогена. Не тренируйся натощак, если цель — сила. Креатин моногидрат 3-5 г/день доказанно увеличивает силу.",
    nutritionTipsEn:
      "Protein 1.8-2.2 g/kg body weight. Carbs before workout (1-2 hours prior) for glycogen. Do not train fasted if strength is the goal. Creatine monohydrate 3-5 g/day is proven to increase strength.",
    whenToSeeDoctorRu:
      "Если прогресс упал резко (например, делал 10, стал делать 5), появились боли в локтях или плече — возможно, медиальный эпикондилит («локоть гольфиста»). При болях более 1 недели — к травматологу.",
    whenToSeeDoctorEn:
      "If progress drops sharply (e.g., did 10, now does 5), elbow or shoulder pain appears — possibly medial epicondylitis (golfer's elbow). For pain lasting more than 1 week — see a sports medicine doctor.",
    relatedInjuryBodyParts: ["leftElbow", "rightElbow", "leftShoulder", "rightShoulder"],
  },

  // ============================================================
  // 4. Боль в локтях (медиальный эпикондилит)
  // ============================================================
  {
    slug: "elbow-pain",
    nameRu: "Боли в локтях (медиальный эпикондилит / golfer's elbow)",
    nameEn: "Elbow pain (medial epicondylitis / golfer's elbow)",
    descriptionRu:
      "Боль с внутренней стороны локтя, усиливается при подтягиваниях, сгибании запястья, хвате. Частая травма в калистенике из-за перегрузки мышц-сгибателей предплечья.",
    descriptionEn:
      "Pain on the inner side of the elbow, worsens with pull-ups, wrist flexion, gripping. A common calisthenics injury due to overload of forearm flexors.",
    category: "pain" as ProblemCategory,
    causesRu: [
      "Перетренированность мышц-сгибателей предплечья",
      "Плохая техника: раскачка, рывки, неправильный хват",
      "Недостаточное восстановление между тренировками",
      "Резкое увеличение объёма или интенсивности",
      "Слабые мышцы-разгибатели и ротаторная манжета",
    ],
    causesEn: [
      "Overtraining of forearm flexor muscles",
      "Poor technique: kipping, jerking, incorrect grip",
      "Insufficient recovery between workouts",
      "Sudden increase in volume or intensity",
      "Weak extensor muscles and rotator cuff",
    ],
    solutionsRu: [
      "Полный отдых от подтягиваний 1-2 недели (замени на австралийские с низким объёмом)",
      "Лёд 15 минут 3-4 раза в день в острой фазе (первые 48-72 часа)",
      "NSAID (ибупрофен) коротким курсом 3-5 дней при острой боли — по назначению врача",
      "Eccentric training: медленные разгибания запястья с лёгким весом (1-2 кг)",
      "Постепенное возвращение к подтягиваниям: начать с 30% от прежнего объёма, +10% в неделю",
      "Укрепление ротаторной манжеты и мышц-разгибателей предплечья",
    ],
    solutionsEn: [
      "Full rest from pull-ups for 1-2 weeks (replace with low-volume Australian rows)",
      "Ice for 15 minutes 3-4 times per day in the acute phase (first 48-72 hours)",
      "NSAIDs (ibuprofen) short course of 3-5 days for acute pain — as prescribed",
      "Eccentric training: slow wrist extensions with light weight (1-2 kg)",
      "Gradual return to pull-ups: start at 30% of previous volume, +10% per week",
      "Strengthen the rotator cuff and forearm extensors",
    ],
    recommendedExerciseSlugs: ["pullup-australian"],
    recommendedTechniqueSlugs: ["myofascial-release-ball", "jacobson-progressive-relaxation"],
    nutritionTipsRu:
      "Воспаление снижает омега-3 (EPA+DHA 2-3 г/день). Куркумин 500 мг 2 раза в день с пиперином — противовоспалительный эффект. Витамин D 2000-4000 МЕ — для иммунитета и восстановления.",
    nutritionTipsEn:
      "Reduce inflammation with omega-3 (EPA+DHA 2-3 g/day). Curcumin 500 mg twice a day with piperine — anti-inflammatory effect. Vitamin D 2000-4000 IU — for immunity and recovery.",
    whenToSeeDoctorRu:
      "ОБЯЗАТЕЛЬНО: если боль не проходит 2+ недели, есть онемение пальцев, слабость хвата, отёк локтя или щелчки. УЗИ или МРТ локтевого сустава. Запущенный эпикондилит может перейти в хронический — лечится месяцами.",
    whenToSeeDoctorEn:
      "MANDATORY: if pain persists 2+ weeks, finger numbness, grip weakness, elbow swelling or clicking. Ultrasound or MRI of the elbow. Untreated epicondylitis can become chronic — takes months to treat.",
    relatedInjuryBodyParts: ["leftElbow", "rightElbow"],
  },

  // ============================================================
  // 5. Импинджмент плеча
  // ============================================================
  {
    slug: "shoulder-impingement",
    nameRu: "Боль в плече при отжиманиях над головой",
    nameEn: "Shoulder pain with overhead movements",
    descriptionRu:
      "Боль в передне-латеральной части плеча при отжиманиях над головой (hspu, pike push-ups), отведении руки вверх. Синдром импинджмента — защемление сухожилий ротаторной манжеты.",
    descriptionEn:
      "Pain in the anterolateral shoulder with overhead push-ups (hspu, pike push-ups), arm elevation. Impingement syndrome — pinching of rotator cuff tendons.",
    category: "pain" as ProblemCategory,
    causesRu: [
      "Слабая ротаторная манжета (особенно надостная и подостная мышцы)",
      "Плохая техника: отсутствие внешнего вращения в отжиманиях над головой",
      "Недостаточная разминка плечевого сустава",
      "Гиперкифоз (округлая спина) — меняет биомеханику лопатки",
      "Перетренированность жимовых мышц на фоне слабых тянущих",
    ],
    causesEn: [
      "Weak rotator cuff (especially supraspinatus and infraspinatus)",
      "Poor technique: lack of external rotation in overhead push-ups",
      "Insufficient shoulder joint warm-up",
      "Hyperkyphosis (rounded back) — changes scapular biomechanics",
      "Overtraining of pushing muscles against weak pulling muscles",
    ],
    solutionsRu: [
      "Ротаторные упражнения с эспандером: внешнее вращение, 3 подхода по 15-20 повторений",
      "Полная разминка плеча перед тренировкой: круги, cat-cow, downward-dog",
      "Снизь объём жимовых упражнений на 50%, повысь объём тянущих",
      "Техника: в hspu и pike push-ups удерживай внешнее вращение плеч (локти назад, не в стороны)",
      "Укрепи нижнюю трапецию и заднюю дельту (face pulls, reverse flyes)",
      "Мобильность грудного отдела: cat-cow, вращения на четвереньках",
    ],
    solutionsEn: [
      "Rotator exercises with resistance band: external rotation, 3 sets of 15-20 reps",
      "Full shoulder warm-up before training: circles, cat-cow, downward-dog",
      "Reduce pushing volume by 50%, increase pulling volume",
      "Technique: in hspu and pike push-ups maintain external rotation (elbows back, not out)",
      "Strengthen lower trapezius and posterior deltoid (face pulls, reverse flyes)",
      "Thoracic mobility: cat-cow, quadruped rotations",
    ],
    recommendedExerciseSlugs: ["shoulder-circles", "cat-cow", "downward-dog"],
    recommendedTechniqueSlugs: ["external-focus", "tactile-anchoring"],
    nutritionTipsRu:
      "Коллаген 15 г/день + витамин C 500 мг — для синтеза коллагена в сухожилиях. Омега-3 — против воспаления. Достаточно белка 1.6-2.0 г/кг.",
    nutritionTipsEn:
      "Collagen 15 g/day + vitamin C 500 mg — for tendon collagen synthesis. Omega-3 — anti-inflammatory. Adequate protein 1.6-2.0 g/kg.",
    whenToSeeDoctorRu:
      "При болях более 1 недели, слабости при поднятии руки (особенно боковое поднятие), щелчках или ощущение «защёлкивания» в плече. МРТ плечевого сустава. Возможен разрыв ротаторной манжеты.",
    whenToSeeDoctorEn:
      "For pain lasting more than 1 week, weakness when raising the arm (especially lateral raise), clicking or snapping sensation in the shoulder. MRI of the shoulder joint. Possible rotator cuff tear.",
    relatedInjuryBodyParts: ["leftShoulder", "rightShoulder"],
  },

  // ============================================================
  // 6. Боль в пояснице
  // ============================================================
  {
    slug: "lower-back-pain",
    nameRu: "Боли в пояснице",
    nameEn: "Lower back pain",
    descriptionRu:
      "Боль в нижней части спины, усиливается после тренировок с нагрузкой на кор (планка, L-сит, horizont). Может быть мышечной или связана с дисками.",
    descriptionEn:
      "Pain in the lower back, worsens after core-loading workouts (plank, L-sit, planche). May be muscular or disc-related.",
    category: "pain" as ProblemCategory,
    causesRu: [
      "Слабый кор: не справляется с нагрузкой, «проваливается» в пояснице",
      "Плохая техника: гиперэкстензия (прогиб) в планке и horizont",
      "Недостаточная мобильность тазобедренного сустава компенсируется поясницей",
      "Гиперкифоз или гиперлордоз — нарушена нейтральная позиция позвоночника",
      "Резкое увеличение объёма коровых упражнений",
    ],
    causesEn: [
      "Weak core: cannot handle the load, lower back collapses",
      "Poor technique: hyperextension (arching) in plank and planche",
      "Insufficient hip mobility compensated by the lower back",
      "Hyperkyphosis or hyperlordosis — neutral spine position disrupted",
      "Sudden increase in core exercise volume",
    ],
    solutionsRu: [
      "Укрепление кора: hollow-hold, plank, dead bug, bird dog — 3-4 раза в неделю",
      "Мобилизация поясницы: cat-cow, knee-to-chest, thoracic rotations",
      "Техника: в планке подкрути таз назад (posterior pelvic tilt), удерживай нейтральный позвоночник",
      "Отдых 2-3 дня от тяжёлых коровых упражнений в острой фазе",
      "Растяжка сгибателей бедра и подвздошно-поясничной мышцы",
      "Мостик (glute bridge) для активации ягодиц — снимает нагрузку с поясницы",
    ],
    solutionsEn: [
      "Core strengthening: hollow-hold, plank, dead bug, bird dog — 3-4 times per week",
      "Lower back mobilization: cat-cow, knee-to-chest, thoracic rotations",
      "Technique: in plank, posterior pelvic tilt, maintain neutral spine",
      "Rest 2-3 days from heavy core exercises in the acute phase",
      "Stretch hip flexors and iliopsoas",
      "Glute bridge to activate glutes — relieves lower back load",
    ],
    recommendedExerciseSlugs: ["plank", "hollow-hold", "cat-cow"],
    recommendedTechniqueSlugs: ["jacobson-progressive-relaxation"],
    nutritionTipsRu:
      "Противовоспалительное питание: омега-3, куркумин, имбирь. Поддерживай витамин D 2000-4000 МЕ (важен для мышечного тонуса). Магний 400 мг/день — расслабляет мышцы.",
    nutritionTipsEn:
      "Anti-inflammatory nutrition: omega-3, curcumin, ginger. Maintain vitamin D 2000-4000 IU (important for muscle tone). Magnesium 400 mg/day — relaxes muscles.",
    whenToSeeDoctorRu:
      "ОБЯЗАТЕЛЬНО: иррадиация боли в ногу (особенно ниже колена), онемение, слабость в стопе, нарушение мочеиспускания. МРТ пояснично-крестцового отдела. Возможна грыжа диска или компрессия корешка.",
    whenToSeeDoctorEn:
      "MANDATORY: pain radiating to the leg (especially below the knee), numbness, foot weakness, urinary dysfunction. MRI of the lumbosacral spine. Possible disc herniation or nerve root compression.",
    relatedInjuryBodyParts: ["lowerBack"],
  },

  // ============================================================
  // 7. Нет прогресса в силе
  // ============================================================
  {
    slug: "no-progress-strength",
    nameRu: "Нет прогресса в силе",
    nameEn: "No progress in strength",
    descriptionRu:
      "Сила «залипла»: не растут ни повторения, ни удержания, ни сложность упражнений. Чувство, что стоишь на месте.",
    descriptionEn:
      "Strength is stuck: reps, holds, exercise complexity are not improving. Feeling of being stuck in place.",
    category: "strength" as ProblemCategory,
    causesRu: [
      "Недостаточное восстановление: мышцы и ЦНС не успевают адаптироваться",
      "Монотонная программа без прогрессии нагрузки",
      "Плохое питание: мало белка, мало калорий",
      "Хронический стресс повышает кортизол — катаболический гормон",
      "Недосып (менее 7 часов) снижает синтез тестостерона и IGF-1",
      "Отсутствие deload-недель — накопление усталости",
    ],
    causesEn: [
      "Insufficient recovery: muscles and CNS do not adapt",
      "Monotonous program without progressive overload",
      "Poor nutrition: low protein, low calories",
      "Chronic stress raises cortisol — a catabolic hormone",
      "Sleep deprivation (less than 7 hours) lowers testosterone and IGF-1",
      "Lack of deload weeks — cumulative fatigue",
    ],
    solutionsRu: [
      "Deload-неделя каждые 4-6 недель: объём -40%, интенсивность -10%",
      "Прогрессивная перегрузка: +1 повторение или +2-5% нагрузки каждую неделю",
      "Белок 1.8-2.2 г/кг массы тела, углеводы 4-6 г/кг для гликогена",
      "Сон 7-9 часов: именно в фазе deep sleep вырабатывается тестостерон и GH",
      "Журнал тренировок: записывай все подходы, повторения, ощущения",
      "Периодизация: чередуй силовые фазы (3-5 повт) и гипертрофические (8-12 повт)",
      "Управление стрессом: дыхание, медитация, природа",
    ],
    solutionsEn: [
      "Deload week every 4-6 weeks: volume -40%, intensity -10%",
      "Progressive overload: +1 rep or +2-5% load each week",
      "Protein 1.8-2.2 g/kg body weight, carbs 4-6 g/kg for glycogen",
      "Sleep 7-9 hours: testosterone and GH peak in deep sleep",
      "Training journal: log all sets, reps, sensations",
      "Periodization: alternate strength phases (3-5 reps) and hypertrophy (8-12 reps)",
      "Stress management: breathing, meditation, nature",
    ],
    recommendedExerciseSlugs: [],
    recommendedTechniqueSlugs: [
      "progress-journal",
      "discipline-over-motivation",
      "five-years-patience",
    ],
    nutritionTipsRu:
      "Избыток калорий +100-300 ккал от поддерживающего уровня для роста силы. Белок 2.0-2.2 г/кг. Креатин моногидрат 5 г/день — доказанно повышает силовые показатели. β-alanine 3-5 г/день — для взрывной силы.",
    nutritionTipsEn:
      "Calorie surplus +100-300 kcal above maintenance for strength growth. Protein 2.0-2.2 g/kg. Creatine monohydrate 5 g/day — proven to boost strength. β-alanine 3-5 g/day — for explosive strength.",
    whenToSeeDoctorRu:
      "При резком падении силы (более 30% за месяц), хронической усталости, потере мышечной массы — проверить гормоны: тестостерон (общий и свободный), кортизол, ТТГ, витамин D. Эндокринолог.",
    whenToSeeDoctorEn:
      "For a sharp drop in strength (more than 30% in a month), chronic fatigue, muscle loss — check hormones: testosterone (total and free), cortisol, TSH, vitamin D. Endocrinologist.",
    relatedInjuryBodyParts: [],
  },

  // ============================================================
  // 8. Потеря мотивации / выгорание
  // ============================================================
  {
    slug: "motivation-loss",
    nameRu: "Потеря мотивации / выгорание",
    nameEn: "Motivation loss / burnout",
    descriptionRu:
      "Нет желания тренироваться, тренировки воспринимаются как обязанность, раньше было удовольствие — сейчас рутина. Часто сопровождается чувством вины за пропуски.",
    descriptionEn:
      "No desire to train, workouts feel like an obligation, what used to be a pleasure is now routine. Often accompanied by guilt for missed workouts.",
    category: "recovery" as ProblemCategory,
    causesRu: [
      "Монотонность программы: одни и те же упражнения неделями",
      "Хронический стресс: работа, отношения, финансы истощают ресурс ЦНС",
      "Отсутствие видимого прогресса — нет дофаминового вознаграждения",
      "Сравнение себя с другими (соцсети) — чувство «у меня не выйдет»",
      "Недосып и плохое питание снижают мотивацию на нейрохимическом уровне",
      "Слишком высокие ожидания от себя",
    ],
    causesEn: [
      "Monotony of the program: same exercises for weeks",
      "Chronic stress: work, relationships, finances drain CNS resources",
      "Lack of visible progress — no dopamine reward",
      "Comparison with others (social media) — feeling of «I won't succeed»",
      "Sleep deprivation and poor nutrition reduce motivation neurochemically",
      "Too high expectations of oneself",
    ],
    solutionsRu: [
      "Разнообразие: попробуй новую ветвь (статика, взрыв, мобильность) или новое упражнение",
      "Полный отдых от тренировок 1-2 недели — дать ЦНС восстановиться",
      "Поставь новые конкретные цели (например, через раздел «Цели» в приложении)",
      "Сравнивай только с собой в прошлом — веди журнал прогресса",
      "Тренируйся с другом или в группе — социальная поддержка мощный мотиватор",
      "Снизь объём: 2 короткие тренировки в неделю лучше, чем 4 «через силу»",
      "Найди «почему» — ради чего ты тренируешься в долгосрочной перспективе",
    ],
    solutionsEn: [
      "Variety: try a new branch (statics, explosive, mobility) or a new exercise",
      "Full rest from training for 1-2 weeks — let the CNS recover",
      "Set new specific goals (e.g., via the «Goals» section in the app)",
      "Compare only with your past self — keep a progress journal",
      "Train with a friend or group — social support is a powerful motivator",
      "Reduce volume: 2 short workouts per week are better than 4 «forced» ones",
      "Find your «why» — what you train for in the long term",
    ],
    recommendedExerciseSlugs: [],
    recommendedTechniqueSlugs: [
      "discipline-over-motivation",
      "compare-to-past-self",
      "ego-detachment",
      "self-compassion-in-failure",
    ],
    nutritionTipsRu:
      "Проверь, что получаешь достаточно витамина D (2000-4000 МЕ) и омега-3 — оба влияют на настроение. Сложные углеводы поддерживают стабильный уровень серотонина. Избегай крайних диет — они усиливают выгорание.",
    nutritionTipsEn:
      "Make sure you get enough vitamin D (2000-4000 IU) and omega-3 — both affect mood. Complex carbs support stable serotonin levels. Avoid extreme diets — they amplify burnout.",
    whenToSeeDoctorRu:
      "При депрессивных симптомах более 2 недель: потеря интереса ко всему, нарушения сна, аппетита, чувство безнадёжности, суицидальные мысли — обратиться к психотерапевту или психиатру. Это не слабость — это химия мозга, и она лечится.",
    whenToSeeDoctorEn:
      "For depressive symptoms lasting more than 2 weeks: loss of interest in everything, sleep/appetite disturbances, hopelessness, suicidal thoughts — see a psychotherapist or psychiatrist. It is not weakness — it is brain chemistry, and it is treatable.",
    relatedInjuryBodyParts: [],
  },
];
