// Дерево навыков RPG — структура ветвей и узлов.
// Концепция: прогрессия в калистенике как дерево прокачки в RPG (Diablo, PoE).
// Источники: Overcoming Gravity (Steven Low), Convict Conditioning (Paul Wade),
// Building the Gymnastic Body (Sommer), GMB Fitness, Yuri Marmerstein.
//
// Гейты: gateSec (для статики) — обычно 20 сек удержания с чистой техникой.
// gateReps (для динамики) — повторения с чистой техникой.
// Пассивки открываются автоматически вместе с родительским узлом (unlocksPassive).

import type { SkillBranch, SkillNodeType, SkillNode } from "@/lib/types";

// Хелпер: делает узел без id (id присваивается БД при seed).
function node(n: Omit<SkillNode, "id">): Omit<SkillNode, "id"> {
  return n;
}

// Координаты:
// x: 0-100 (горизонталь) — основная линия x=50, пассивки x=20 (лево) / x=80 (право)
// y: 0-100 (вертикаль) — пропорционально order (1 → y=10, 2 → y=20, и т.д.)
// Для под-веток статика: planche x=20, front-lever x=50, handstand x=80.

export const SKILL_NODES: Omit<SkillNode, "id">[] = [
  // ============================================================
  // ВЕТВЬ 1: PULL (Тяги) — 8 узлов
  // Путь: австралийские → классические → печатная машинка/жиронда → выход силой
  // ============================================================
  node({
    slug: "pull-australian",
    exerciseSlug: "pullup-australian",
    nameRu: "Австралийские подтягивания",
    nameEn: "Australian pull-ups",
    descriptionRu:
      "Горизонтальные подтягивания на низкой перекладине. Базовая горизонтальная тяга, готовит широчайшие и ромбовидные к вертикальным подтягиваниям.",
    descriptionEn:
      "Horizontal pull-ups on a low bar. Basic horizontal pull, prepares lats and rhomboids for vertical pull-ups.",
    branch: "pull" as SkillBranch,
    type: "foundational" as SkillNodeType,
    order: 1,
    gateReps: 15,
    gateNotesRu: "15 чистых повторений с телом в одну линию, грудь касается перекладины.",
    gateNotesEn: "15 clean reps with body in a straight line, chest touches the bar.",
    prerequisites: [],
    x: 50,
    y: 10,
    loadCoef: 1,
  }),
  node({
    slug: "pull-classic",
    exerciseSlug: "pullup-classic",
    nameRu: "Подтягивания классические",
    nameEn: "Classic pull-ups",
    descriptionRu:
      "Вертикальные подтягивания прямым хватом на перекладине. Фундаментальный навык верхней тяги тела.",
    descriptionEn:
      "Vertical pull-ups with overhand grip on the bar. Fundamental upper body pull skill.",
    branch: "pull",
    type: "main",
    order: 2,
    gateReps: 10,
    gateNotesRu: "10 чистых повторений без раскачки, подбородок выше перекладины.",
    gateNotesEn: "10 clean reps without swinging, chin above the bar.",
    prerequisites: ["pull-australian"],
    unlocksPassive: ["pull-chin", "pull-archer"],
    x: 50,
    y: 20,
    loadCoef: 4,
  }),
  node({
    slug: "pull-chin",
    exerciseSlug: "pullup-chin",
    nameRu: "Подтягивания обратным хватом",
    nameEn: "Chin-ups",
    descriptionRu:
      "Подтягивания обратным хватом. Смещает акцент на бицепс плеча. Открывается автоматически с классикой.",
    descriptionEn:
      "Pull-ups with underhand grip. Shifts emphasis to biceps. Unlocks automatically with classic pull-ups.",
    branch: "pull",
    type: "passive",
    order: 3,
    prerequisites: ["pull-classic"],
    x: 20,
    y: 20,
    loadCoef: 3,
  }),
  node({
    slug: "pull-archer",
    exerciseSlug: "pullup-archer",
    nameRu: "Подтягивания лучника",
    nameEn: "Archer pull-ups",
    descriptionRu:
      "Подтягивания с переносом веса на одну руку, вторая прямая в стороне. Подводящее к подтягиваниям на одной руке. Открывается автоматически с классикой.",
    descriptionEn:
      "Pull-ups shifting weight to one arm, the other straight out to the side. Progression toward one-arm pull-ups. Unlocks automatically with classic pull-ups.",
    branch: "pull",
    type: "passive",
    order: 3,
    prerequisites: ["pull-classic"],
    x: 80,
    y: 20,
    loadCoef: 6,
  }),
  node({
    slug: "pull-typewriter",
    exerciseSlug: "typewriter-pullup",
    nameRu: "Подтягивания «печатная машинка»",
    nameEn: "Typewriter pull-ups",
    descriptionRu:
      "Подтягивания со скольжением в стороны из верхней точки. Развивает асимметричную силу и контроль.",
    descriptionEn:
      "Pull-ups sliding side to side from the top position. Develops asymmetric strength and control.",
    branch: "pull",
    type: "milestone",
    order: 4,
    gateReps: 8,
    gateNotesRu: "8 повторений с полным скольжением в каждую сторону, без рывков.",
    gateNotesEn: "8 reps with full slide to each side, no jerks.",
    prerequisites: ["pull-classic"],
    x: 50,
    y: 40,
    loadCoef: 6,
  }),
  node({
    slug: "pull-gironda",
    exerciseSlug: "pullup-gironda",
    nameRu: "Подтягивания Жиронды",
    nameEn: "Gironda sternum pull-ups",
    descriptionRu:
      "Подтягивания с касанием перекладины грудиной. Смещает вектор на горизонтальную тягу — подводящее к переднему вису.",
    descriptionEn:
      "Pull-ups touching the bar with sternum. Shifts the vector toward horizontal pull — front lever progression.",
    branch: "pull",
    type: "main",
    order: 5,
    gateReps: 8,
    gateNotesRu: "8 чистых повторений с касанием грудиной, тело под 45°, без раскачки.",
    gateNotesEn: "8 clean reps touching sternum, body at 45°, no swinging.",
    prerequisites: ["pull-classic"],
    x: 50,
    y: 50,
    loadCoef: 5,
  }),
  node({
    slug: "pull-lsit-up",
    exerciseSlug: "pullup-lsit",
    nameRu: "Подтягивания в L-сите",
    nameEn: "L-sit pull-ups",
    descriptionRu:
      "Подтягивания с удержанием ног под углом 90° (L-сит). Комбинирует тягу с кором. Усложнённая вариация классики.",
    descriptionEn:
      "Pull-ups holding legs at 90° (L-sit). Combines pull with core. Harder variation of classic pull-ups.",
    branch: "pull",
    type: "milestone",
    order: 6,
    gateReps: 6,
    gateNotesRu: "6 чистых повторений с прямыми ногами под 90°, без опускания ног.",
    gateNotesEn: "6 clean reps with straight legs at 90°, without dropping legs.",
    prerequisites: ["pull-classic"],
    x: 50,
    y: 60,
    loadCoef: 6,
  }),
  node({
    slug: "muscle-up",
    exerciseSlug: "muscle-up",
    nameRu: "Выход силой (Muscle-up)",
    nameEn: "Muscle-up",
    descriptionRu:
      "Переход из виса в упор на перекладине одним движением. Комбинирует взрывную тягу с переходом через перекладину. Элитный навык верхней тяги.",
    descriptionEn:
      "Transition from hang to support on the bar in one motion. Combines explosive pull with transition over the bar. Elite upper pull skill.",
    branch: "pull",
    type: "elite",
    order: 7,
    gateReps: 5,
    gateNotesRu: "5 чистых выходов без ложного хвата, без раскачки, с прямой спиной в упоре.",
    gateNotesEn: "5 clean muscle-ups without false grip, no kipping, straight back in support.",
    prerequisites: ["pull-typewriter", "pull-gironda"],
    x: 50,
    y: 70,
    loadCoef: 7,
    isElite: true,
  }),

  // ============================================================
  // ВЕТВЬ 2: PUSH (Жимы) — 7 узлов
  // Путь: с колен → классика → псевдо-планш → HSPU / на одной руке
  // ============================================================
  node({
    slug: "push-knees",
    nameRu: "Отжимания с колен",
    nameEn: "Knee push-ups",
    descriptionRu:
      "Отжимания с опорой на колени. Стартовая точка для освоения жимовой механики. Сниженная нагрузка, фокус на позицию.",
    descriptionEn:
      "Push-ups with knees on the ground. Starting point for mastering push mechanics. Reduced load, focus on position.",
    branch: "push",
    type: "foundational",
    order: 1,
    gateReps: 15,
    gateNotesRu: "15 чистых повторений с прямой линией от колен до головы, локти под 45°.",
    gateNotesEn: "15 clean reps with straight line from knees to head, elbows at 45°.",
    prerequisites: [],
    x: 50,
    y: 10,
    loadCoef: 1,
  }),
  node({
    slug: "push-classic",
    exerciseSlug: "pushup-classic",
    nameRu: "Отжимания классические",
    nameEn: "Classic push-ups",
    descriptionRu:
      "Отжимания от пола в упоре лёжа. Фундаментальный жимовый навык. Развивает грудь, трицепс, переднюю дельту, кор.",
    descriptionEn:
      "Floor push-ups in plank position. Fundamental push skill. Develops chest, triceps, anterior deltoid, core.",
    branch: "push",
    type: "main",
    order: 2,
    gateReps: 15,
    gateNotesRu: "15 чистых повторений с прямой линией тела, грудь касается пола.",
    gateNotesEn: "15 clean reps with straight body line, chest touches the floor.",
    prerequisites: ["push-knees"],
    unlocksPassive: ["push-diamond", "push-archer"],
    x: 50,
    y: 20,
    loadCoef: 2,
  }),
  node({
    slug: "push-diamond",
    exerciseSlug: "pushup-diamond",
    nameRu: "Отжимания алмаз",
    nameEn: "Diamond push-ups",
    descriptionRu:
      "Отжимания с кистями вместе под грудью (алмазом). Смещают акцент на трицепс. Открывается автоматически с классикой.",
    descriptionEn:
      "Push-ups with hands together under chest (diamond). Shifts emphasis to triceps. Unlocks automatically with classic push-ups.",
    branch: "push",
    type: "passive",
    order: 3,
    prerequisites: ["push-classic"],
    x: 20,
    y: 20,
    loadCoef: 3,
  }),
  node({
    slug: "push-archer",
    exerciseSlug: "pushup-archer",
    nameRu: "Отжимания лучника",
    nameEn: "Archer push-ups",
    descriptionRu:
      "Отжимания с переносом веса на одну руку, вторая прямая в стороне. Подводящее к отжиманиям на одной руке. Открывается автоматически с классикой.",
    descriptionEn:
      "Push-ups shifting weight to one arm, the other straight out to the side. Progression toward one-arm push-ups. Unlocks automatically with classic push-ups.",
    branch: "push",
    type: "passive",
    order: 3,
    prerequisites: ["push-classic"],
    x: 80,
    y: 20,
    loadCoef: 4,
  }),
  node({
    slug: "push-pseudo-planche",
    exerciseSlug: "pushup-pseudo-planche",
    nameRu: "Отжимания псевдо-планш",
    nameEn: "Pseudo planche push-ups",
    descriptionRu:
      "Отжимания со смещением центра тяжести вперёд (руки у бёдер). Нагружает переднюю дельту в динамике — подводящее к горизонту.",
    descriptionEn:
      "Push-ups with center of gravity shifted forward (hands at hips). Loads anterior deltoid dynamically — planche progression.",
    branch: "push",
    type: "milestone",
    order: 4,
    gateReps: 10,
    gateNotesRu: "10 чистых повторений с наклоном вперёд, локти прижаты, без прогиба в пояснице.",
    gateNotesEn: "10 clean reps with forward lean, elbows tucked, no lower back arch.",
    prerequisites: ["push-classic"],
    x: 50,
    y: 40,
    loadCoef: 5,
  }),
  node({
    slug: "hspu-wall",
    exerciseSlug: "hspu-wall",
    nameRu: "Отжимания в стойке на руках (у стены)",
    nameEn: "Handstand push-ups (wall)",
    descriptionRu:
      "Отжимания в стойке на руках у стены. Элитный жим плечами и трицепсом. Комбинирует баланс с силой.",
    descriptionEn:
      "Push-ups in handstand against the wall. Elite shoulder/triceps press. Combines balance with strength.",
    branch: "push",
    type: "elite",
    order: 5,
    gateReps: 5,
    gateNotesRu: "5 чистых повторений головой до касания пола и обратно, без заваливания.",
    gateNotesEn: "5 clean reps head-to-floor and back up, no tipping.",
    prerequisites: ["push-pseudo-planche"],
    x: 50,
    y: 50,
    loadCoef: 6,
    isElite: true,
  }),
  node({
    slug: "push-one-arm",
    exerciseSlug: "pushup-onearm-wall",
    nameRu: "Отжимания на одной руке",
    nameEn: "One-arm push-ups",
    descriptionRu:
      "Отжимания с опорой на одну руку. Элитный жимовый навык, требует огромной силы груди, трицепса и кора для стабилизации.",
    descriptionEn:
      "Push-ups supported on one arm. Elite push skill, requires immense chest, triceps and core strength for stabilization.",
    branch: "push",
    type: "elite",
    order: 6,
    gateReps: 3,
    gateNotesRu: "3 чистых повторения на каждую руку с ногами на ширине плеч, без проваливания.",
    gateNotesEn: "3 clean reps per arm with feet shoulder-width, no sagging.",
    prerequisites: ["push-archer"],
    x: 50,
    y: 60,
    loadCoef: 8,
    isElite: true,
  }),

  // ============================================================
  // ВЕТВЬ 3: CORE (Кор) — 6 узлов
  // Путь: планка → подъём ног в висе → L-сит → V-сит / dragon flag
  // ============================================================
  node({
    slug: "plank",
    exerciseSlug: "plank",
    nameRu: "Планка",
    nameEn: "Plank",
    descriptionRu:
      "Удержание упора лёжа на предплечьях. Базовая изометрия кора, учит анти-экстензии (не проваливать поясницу).",
    descriptionEn:
      "Holding forearm plank position. Basic core isometric, teaches anti-extension (don't sag the lower back).",
    branch: "core",
    type: "foundational",
    order: 1,
    gateSec: 60,
    gateNotesRu: "60 секунд с прямой линией тела, без проваливания поясницы, лопатки нейтральны.",
    gateNotesEn: "60 seconds with straight body line, no lower back sag, shoulder blades neutral.",
    prerequisites: [],
    unlocksPassive: ["hollow-hold"],
    x: 50,
    y: 10,
    loadCoef: 1,
  }),
  node({
    slug: "hanging-leg-raise",
    exerciseSlug: "hanging-leg-raise",
    nameRu: "Подъём ног в висе",
    nameEn: "Hanging leg raises",
    descriptionRu:
      "Подъём прямых ног в висе на перекладине до касания перекладины. Динамическая работа кора против гравитации.",
    descriptionEn:
      "Raising straight legs in hang on the bar to touch the bar. Dynamic core work against gravity.",
    branch: "core",
    type: "main",
    order: 2,
    gateReps: 12,
    gateNotesRu: "12 чистых повторений с прямыми ногами, без раскачки, до касания перекладины.",
    gateNotesEn: "12 clean reps with straight legs, no swing, touching the bar.",
    prerequisites: ["plank"],
    x: 50,
    y: 20,
    loadCoef: 4,
  }),
  node({
    slug: "hollow-hold",
    exerciseSlug: "hollow-hold",
    nameRu: "Hollow body",
    nameEn: "Hollow body hold",
    descriptionRu:
      "Удержание «hollow body» — прижатая к полу поясница, поднятые плечи и прямые ноги. Фундаментальная гимнастическая позиция.",
    descriptionEn:
      "Hollow body hold — lower back pressed to floor, raised shoulders and straight legs. Foundational gymnastics position.",
    branch: "core",
    type: "passive",
    order: 2,
    prerequisites: ["plank"],
    x: 20,
    y: 20,
    loadCoef: 2,
  }),
  node({
    slug: "lsit-floor",
    exerciseSlug: "lsit-floor",
    nameRu: "L-сит на полу",
    nameEn: "L-sit on floor",
    descriptionRu:
      "Удержание угла 90° с прямыми ногами на полу, опора на руки. Спина прямая, ноги параллельны полу.",
    descriptionEn:
      "Holding 90° angle with straight legs on floor, supported on hands. Back straight, legs parallel to floor.",
    branch: "core",
    type: "milestone",
    order: 3,
    gateSec: 20,
    gateNotesRu: "20 секунд с прямыми ногами под 90°, спина прямая, локти заблокированы.",
    gateNotesEn: "20 seconds with straight legs at 90°, back straight, elbows locked.",
    prerequisites: ["hanging-leg-raise"],
    x: 50,
    y: 40,
    loadCoef: 5,
  }),
  node({
    slug: "vsit",
    nameRu: "V-сит (уголок)",
    nameEn: "V-sit",
    descriptionRu:
      "Удержание угла 45° (ноги выше горизонтали). Элитная версия L-сита. Требует экстремальной гибкости сгибателей бедра и силы кора.",
    descriptionEn:
      "Holding 45° angle (legs above horizontal). Elite version of L-sit. Requires extreme hip flexor flexibility and core strength.",
    branch: "core",
    type: "elite",
    order: 4,
    gateSec: 10,
    gateNotesRu: "10 секунд с ногами выше горизонтали (угол ≤45°), спина прямая.",
    gateNotesEn: "10 seconds with legs above horizontal (≤45° angle), back straight.",
    prerequisites: ["lsit-floor"],
    x: 50,
    y: 50,
    loadCoef: 7,
    isElite: true,
  }),
  node({
    slug: "dragon-flag",
    exerciseSlug: "dragon-flag",
    nameRu: "Dragon flag",
    nameEn: "Dragon flag",
    descriptionRu:
      "Удержание тела вертикально вверх, опираясь только на плечи/лопатки (Брюс Ли). Элитная изометрия кора.",
    descriptionEn:
      "Holding body vertical upward, supported only on shoulders/shoulder blades (Bruce Lee). Elite core isometric.",
    branch: "core",
    type: "elite",
    order: 5,
    gateReps: 8,
    gateNotesRu: "8 чистых повторений с прямым телом, без проваливания бёдер, без рывков.",
    gateNotesEn: "8 clean reps with straight body, no hip sag, no jerks.",
    prerequisites: ["hanging-leg-raise"],
    x: 50,
    y: 60,
    loadCoef: 5,
    isElite: true,
  }),

  // ============================================================
  // ВЕТВЬ 4: LEGS (Ноги) — 5 узлов
  // Путь: присед → выпады → прыжок → пистолет с опорой → пистолет
  // ============================================================
  node({
    slug: "squat",
    exerciseSlug: "squat",
    nameRu: "Приседания",
    nameEn: "Squats",
    descriptionRu:
      "Классические приседания с собственным весом. Базовый навык нижнего тела. Развивает квадрицепсы, ягодицы, кор.",
    descriptionEn:
      "Classic bodyweight squats. Basic lower body skill. Develops quads, glutes, core.",
    branch: "legs",
    type: "foundational",
    order: 1,
    gateReps: 30,
    gateNotesRu: "30 чистых повторений с полной амплитудой (бёдра ниже параллели), спина прямая.",
    gateNotesEn: "30 clean reps with full range (hips below parallel), back straight.",
    prerequisites: [],
    unlocksPassive: ["lunge"],
    x: 50,
    y: 10,
    loadCoef: 1,
  }),
  node({
    slug: "lunge",
    exerciseSlug: "lunge",
    nameRu: "Выпады",
    nameEn: "Lunges",
    descriptionRu:
      "Выпады с шагом вперёд. Унилатеральный навык — развивает одну ногу за раз, готовит к пистолету. Открывается с приседом.",
    descriptionEn:
      "Forward lunges. Unilateral skill — develops one leg at a time, prepares for pistol. Unlocks with squats.",
    branch: "legs",
    type: "passive",
    order: 1,
    prerequisites: ["squat"],
    x: 20,
    y: 10,
    loadCoef: 2,
  }),
  node({
    slug: "jump-squat",
    exerciseSlug: "jump-squat",
    nameRu: "Приседания с прыжком",
    nameEn: "Jump squats",
    descriptionRu:
      "Приседания со взрывным выпрыгиванием. Плиометрический навык — развивает быстрые мышечные волокна и реактивную силу.",
    descriptionEn:
      "Squats with explosive jump. Plyometric skill — develops fast-twitch muscle fibers and reactive strength.",
    branch: "legs",
    type: "milestone",
    order: 3,
    gateReps: 15,
    gateNotesRu: "15 взрывных повторений с мягким приземлением, без пауз в верхней точке.",
    gateNotesEn: "15 explosive reps with soft landing, no pauses at the top.",
    prerequisites: ["squat"],
    x: 50,
    y: 30,
    loadCoef: 3,
  }),
  node({
    slug: "pistol-assisted",
    exerciseSlug: "pistol-assisted",
    nameRu: "Пистолет с опорой",
    nameEn: "Assisted pistol squat",
    descriptionRu:
      "Приседания на одной ноге с опорой рукой на стену/стул. Подводящее к полному пистолету — учит балансу и силе одной ноги.",
    descriptionEn:
      "Single-leg squats with hand support on wall/chair. Progression toward full pistol — teaches balance and single-leg strength.",
    branch: "legs",
    type: "elite",
    order: 4,
    gateReps: 8,
    gateNotesRu: "8 повторений на каждую ногу с минимальной опорой, полная амплитуда.",
    gateNotesEn: "8 reps per leg with minimal support, full range.",
    prerequisites: ["squat"],
    x: 50,
    y: 40,
    loadCoef: 3,
    isElite: true,
  }),
  node({
    slug: "pistol-full",
    nameRu: "Пистолет полный",
    nameEn: "Full pistol squat",
    descriptionRu:
      "Приседания на одной ноге без опоры, вторая нога прямая вперёд. Элитный навык баланса, гибкости и силы ног.",
    descriptionEn:
      "Single-leg squats without support, the other leg straight forward. Elite skill of balance, flexibility and leg strength.",
    branch: "legs",
    type: "elite",
    order: 5,
    gateReps: 5,
    gateNotesRu: "5 чистых повторений на каждую ногу с прямой вытянутой ногой, без касания пола.",
    gateNotesEn: "5 clean reps per leg with straight extended leg, without touching the floor.",
    prerequisites: ["pistol-assisted"],
    x: 50,
    y: 50,
    loadCoef: 6,
    isElite: true,
  }),

  // ============================================================
  // ВЕТВЬ 5: STATIC (Статика) — 8 узлов
  // Три параллельных под-дерева: planche (x=20), front lever (x=50), handstand (x=80)
  // Интегрируется с существующими static-elements.
  // ============================================================
  // --- Под-дерево горизонта (planche) — x=20 ---
  node({
    slug: "planche-tuck",
    exerciseSlug: "planche-tuck",
    nameRu: "Горизонт tucked",
    nameEn: "Tucked planche",
    descriptionRu:
      "Удержание с коленями, прижатыми к груди, опираясь только на руки. Плечи наклонены вперёд, руки прямые. Первый шаг к статике горизонта.",
    descriptionEn:
      "Hold with knees tucked to chest, supported only on hands. Shoulders leaned forward, arms straight. First step toward planche static.",
    branch: "static",
    type: "main",
    order: 1,
    gateSec: 20,
    gateNotesRu: "20 секунд с прямыми руками, локти заблокированы, колени к груди, таз на уровне плеч.",
    gateNotesEn: "20 seconds with straight arms, elbows locked, knees to chest, hips at shoulder level.",
    prerequisites: [],
    x: 20,
    y: 10,
    loadCoef: 7,
  }),
  node({
    slug: "planche-adv-tuck",
    exerciseSlug: "planche-adv-tuck",
    nameRu: "Горизонт adv tucked",
    nameEn: "Advanced tucked planche",
    descriptionRu:
      "Из tucked — выпрями спину, оставив колени согнутыми. Линия спины прямая. Значительно сложнее: та же нагрузка, но без «круглой» спины.",
    descriptionEn:
      "From tucked — straighten back keeping knees bent. Back line straight. Significantly harder: same load but without rounded back.",
    branch: "static",
    type: "milestone",
    order: 2,
    gateSec: 20,
    gateNotesRu: "20 секунд с прямой спиной, колени под 90°, таз на уровне плеч, локти заблокированы.",
    gateNotesEn: "20 seconds with straight back, knees at 90°, hips at shoulder level, elbows locked.",
    prerequisites: ["planche-tuck"],
    x: 20,
    y: 25,
    loadCoef: 8,
  }),
  node({
    slug: "planche-straddle",
    nameRu: "Горизонт straddle",
    nameEn: "Straddle planche",
    descriptionRu:
      "Удержание с ногами, разведёнными в стороны. Уменьшает рычаг за счёт разведения центра тяжести. Заключительный шаг перед full.",
    descriptionEn:
      "Hold with legs spread apart. Reduces lever by spreading center of gravity. Final step before full.",
    branch: "static",
    type: "elite",
    order: 3,
    gateSec: 15,
    gateNotesRu: "15 секунд с прямыми ногами врозь (~60°), спина прямая, таз на уровне плеч.",
    gateNotesEn: "15 seconds with straight legs apart (~60°), back straight, hips at shoulder level.",
    prerequisites: ["planche-adv-tuck"],
    x: 20,
    y: 40,
    loadCoef: 9,
    isElite: true,
  }),
  node({
    slug: "planche-full",
    nameRu: "Горизонт полный",
    nameEn: "Full planche",
    descriptionRu:
      "Полный горизонт с сомкнутыми прямыми ногами. Элитный элемент — требуют огромной относительной силы и многолетней подготовки.",
    descriptionEn:
      "Full planche with straight legs together. Elite element requiring immense relative strength and years of preparation.",
    branch: "static",
    type: "elite",
    order: 4,
    gateSec: 5,
    gateNotesRu: "5 секунд с полностью прямыми ногами вместе, тело параллельно земле, без проваливания таза.",
    gateNotesEn: "5 seconds with fully straight legs together, body parallel to ground, no hip drop.",
    prerequisites: ["planche-straddle"],
    x: 20,
    y: 55,
    loadCoef: 9,
    isElite: true,
  }),
  // --- Под-дерево переднего виса (front lever) — x=50 ---
  node({
    slug: "front-lever-tuck",
    exerciseSlug: "front-lever-tuck",
    nameRu: "Передний вис tucked",
    nameEn: "Tucked front lever",
    descriptionRu:
      "Удержание горизонтального положения лицом вверх, вися на перекладине, колени к груди. Первый шаг к статике переднего виса.",
    descriptionEn:
      "Holding horizontal position face-up, hanging from the bar, knees to chest. First step toward front lever static.",
    branch: "static",
    type: "main",
    order: 5,
    gateSec: 20,
    gateNotesRu: "20 секунд с коленями к груди, спина прямая, руки прямые, тело горизонтально.",
    gateNotesEn: "20 seconds with knees to chest, back straight, arms straight, body horizontal.",
    prerequisites: [],
    x: 50,
    y: 10,
    loadCoef: 7,
  }),
  node({
    slug: "front-lever-adv-tuck",
    exerciseSlug: "front-lever-adv-tuck",
    nameRu: "Передний вис adv tucked",
    nameEn: "Advanced tucked front lever",
    descriptionRu:
      "Из tucked — выпрями спину, оставив колени согнутыми. Линия спины прямая. Усложняет за счёт увеличения рычага.",
    descriptionEn:
      "From tucked — straighten back keeping knees bent. Back line straight. Harder due to increased lever.",
    branch: "static",
    type: "milestone",
    order: 6,
    gateSec: 20,
    gateNotesRu: "20 секунд с прямой спиной, колени под 90°, тело горизонтально, лопатки зафиксированы.",
    gateNotesEn: "20 seconds with straight back, knees at 90°, body horizontal, shoulder blades locked.",
    prerequisites: ["front-lever-tuck"],
    x: 50,
    y: 25,
    loadCoef: 8,
  }),
  node({
    slug: "front-lever-full",
    exerciseSlug: "front-lever-full",
    nameRu: "Передний вис полный",
    nameEn: "Full front lever",
    descriptionRu:
      "Полный передний вис с прямыми ногами вместе. Элитный элемент, требует огромной относительной силы широчайших.",
    descriptionEn:
      "Full front lever with straight legs together. Elite element, requires immense lat relative strength.",
    branch: "static",
    type: "elite",
    order: 7,
    gateSec: 5,
    gateNotesRu: "5 секунд с полностью прямыми ногами вместе, тело в идеальной горизонтали.",
    gateNotesEn: "5 seconds with fully straight legs together, body in perfect horizontal.",
    prerequisites: ["front-lever-adv-tuck"],
    x: 50,
    y: 55,
    loadCoef: 8,
    isElite: true,
  }),
  // --- Под-дерево стойки на руках (handstand) — x=80 ---
  node({
    slug: "handstand-wall",
    exerciseSlug: "handstand-wall",
    nameRu: "Стойка на руках у стены",
    nameEn: "Wall handstand",
    descriptionRu:
      "Удержание стойки на руках с опорой ног о стену. Базовая позиция для развития баланса и силы плеч. Готовит к свободной стойке.",
    descriptionEn:
      "Holding handstand with feet against the wall. Basic position for developing balance and shoulder strength. Prepares for freestanding.",
    branch: "static",
    type: "main",
    order: 8,
    gateSec: 30,
    gateNotesRu: "30 секунд грудью к стене, тело в одну линию, руки на ширине плеч.",
    gateNotesEn: "30 seconds chest-to-wall, body in straight line, hands shoulder-width.",
    prerequisites: [],
    x: 80,
    y: 10,
    loadCoef: 4,
  }),

  // ============================================================
  // ВЕТВЬ 6: EXPLOSIVE (Взрыв) — 5 узлов
  // Путь: берпи → хлопок → Тайсон → взрывной выход силой
  // ============================================================
  node({
    slug: "burpee",
    exerciseSlug: "burpee",
    nameRu: "Берпи",
    nameEn: "Burpee",
    descriptionRu:
      "Комплексное взрывное движение: упор лёжа → отжимание → прыжок вверх. Кардио-фундамент для плиометрики.",
    descriptionEn:
      "Complex explosive movement: plank → push-up → jump up. Cardio foundation for plyometrics.",
    branch: "explosive",
    type: "foundational",
    order: 1,
    gateReps: 20,
    gateNotesRu: "20 берпи без пауз, с полным выпрыгиванием и чистым отжиманием.",
    gateNotesEn: "20 burpees without pauses, with full jump and clean push-up.",
    prerequisites: [],
    x: 50,
    y: 10,
    loadCoef: 3,
  }),
  node({
    slug: "pushup-clapping",
    exerciseSlug: "pushup-clapping",
    nameRu: "Отжимания с хлопком",
    nameEn: "Clapping push-ups",
    descriptionRu:
      "Плиометрические отжимания с отрывом рук и хлопком. Развивают взрывную силу жима и реактивную способность трицепса.",
    descriptionEn:
      "Plyometric push-ups with hands leaving the floor and a clap. Develop explosive push strength and triceps reactive ability.",
    branch: "explosive",
    type: "main",
    order: 2,
    gateReps: 10,
    gateNotesRu: "10 повторений с чистым хлопком и мягким приземлением на прямые руки.",
    gateNotesEn: "10 reps with clean clap and soft landing on straight arms.",
    prerequisites: ["burpee"],
    x: 50,
    y: 25,
    loadCoef: 4,
  }),
  node({
    slug: "pushup-tyson",
    exerciseSlug: "pushup-tyson",
    nameRu: "Отжимания Тайсона",
    nameEn: "Tyson push-ups",
    descriptionRu:
      "Отжимания со смещением корпуса вперёд в верхней точке (вдавливание + скручивание). Плиометрическое подводящее к планшу.",
    descriptionEn:
      "Push-ups with body shifting forward at the top (pressing + twisting). Plyometric planche progression.",
    branch: "explosive",
    type: "milestone",
    order: 3,
    gateReps: 8,
    gateNotesRu: "8 повторений с полным смещением вперёд в верхней точке, без пауз.",
    gateNotesEn: "8 reps with full forward shift at the top, no pauses.",
    prerequisites: ["pushup-clapping"],
    x: 50,
    y: 40,
    loadCoef: 5,
  }),
  node({
    slug: "jump-squat-explosive",
    exerciseSlug: "jump-squat",
    nameRu: "Взрывные приседания",
    nameEn: "Explosive jump squats",
    descriptionRu:
      "Приседания с максимальным выпрыгиванием. Пассивка в ветви взрыва — развивает реактивную силу ног. Открывается с берпи.",
    descriptionEn:
      "Squats with maximum jump. Passive skill in the explosive branch — develops leg reactive strength. Unlocks with burpees.",
    branch: "explosive",
    type: "passive",
    order: 2,
    prerequisites: ["burpee"],
    x: 80,
    y: 25,
    loadCoef: 3,
  }),
  node({
    slug: "muscle-up-explosive",
    exerciseSlug: "muscle-up",
    nameRu: "Взрывной выход силой",
    nameEn: "Explosive muscle-up",
    descriptionRu:
      "Выход силой с отрывом рук от перекладины в верхней точке. Элитный взрывной навык — требует мощной тяги и тайминга перехода. Финальный узел ветви взрыва.",
    descriptionEn:
      "Muscle-up with hands leaving the bar at the top. Elite explosive skill — requires powerful pull and transition timing. Final node of the explosive branch.",
    branch: "explosive",
    type: "elite",
    order: 4,
    gateReps: 3,
    gateNotesRu: "3 чистых взрывных выхода с видимым отрывом рук от перекладины.",
    gateNotesEn: "3 clean explosive muscle-ups with visible hands-off-the-bar.",
    prerequisites: ["pushup-tyson", "muscle-up"],
    x: 50,
    y: 55,
    loadCoef: 9,
    isElite: true,
  }),

  // ============================================================
  // ВЕТВЬ 7: MOBILITY (Мобильность) — 4 узла
  // Путь: кошка-корова → собака мордой вниз → skin the cat → упор на локтях
  // ============================================================
  node({
    slug: "cat-cow",
    exerciseSlug: "cat-cow",
    nameRu: "Кошка-корова",
    nameEn: "Cat-cow",
    descriptionRu:
      "Поочерёдное округление и прогибание спины в коленно-лучевом положении. Базовая мобилизация позвоночника.",
    descriptionEn:
      "Alternating rounding and arching of the back in quadruped position. Basic spine mobilization.",
    branch: "mobility",
    type: "foundational",
    order: 1,
    gateReps: 15,
    gateNotesRu: "15 плавных циклов с полной амплитудой в обоих направлениях.",
    gateNotesEn: "15 smooth cycles with full range in both directions.",
    prerequisites: [],
    x: 50,
    y: 10,
    loadCoef: 1,
  }),
  node({
    slug: "downward-dog",
    exerciseSlug: "downward-dog",
    nameRu: "Собака мордой вниз",
    nameEn: "Downward dog",
    descriptionRu:
      "Удержание позиции «собака мордой вниз» — упор на руки и ноги, таз высоко. Растягивает заднюю цепь, плечи, икры.",
    descriptionEn:
      "Holding downward dog position — supported on hands and feet, hips high. Stretches posterior chain, shoulders, calves.",
    branch: "mobility",
    type: "main",
    order: 2,
    gateSec: 30,
    gateNotesRu: "30 секунд с прямой спиной, пятки стремятся к полу, голова между рук.",
    gateNotesEn: "30 seconds with straight back, heels reaching for floor, head between arms.",
    prerequisites: ["cat-cow"],
    x: 50,
    y: 25,
    loadCoef: 1,
  }),
  node({
    slug: "skin-the-cat",
    exerciseSlug: "skin-the-cat",
    nameRu: "Skin the cat",
    nameEn: "Skin the cat",
    descriptionRu:
      "Гимнастический переход: из виса на перекладине — опускание ног назад через плечи. Растягивает плечи и плечевой пояс.",
    descriptionEn:
      "Gymnastics transition: from bar hang — lowering legs backward through shoulders. Stretches shoulders and shoulder girdle.",
    branch: "mobility",
    type: "milestone",
    order: 3,
    gateReps: 5,
    gateNotesRu: "5 контролируемых проходов с полной амплитудой, без рывков.",
    gateNotesEn: "5 controlled passes with full range, no jerks.",
    prerequisites: ["downward-dog"],
    x: 50,
    y: 40,
    loadCoef: 4,
  }),
  node({
    slug: "elbow-lever",
    exerciseSlug: "elbow-lever",
    nameRu: "Упор на локтях (Mayurasana)",
    nameEn: "Elbow lever (Mayurasana)",
    descriptionRu:
      "Удержание горизонтального положения тела с опорой локтями на живот. Йогическая позиция баланса. Элитный навык мобильности/баланса.",
    descriptionEn:
      "Holding horizontal body position with elbows supported on the abdomen. Yogic balance position. Elite mobility/balance skill.",
    branch: "mobility",
    type: "elite",
    order: 4,
    gateSec: 20,
    gateNotesRu: "20 секунд с прямым телом параллельно полу, локти упираются в живот.",
    gateNotesEn: "20 seconds with straight body parallel to floor, elbows pressing into abdomen.",
    prerequisites: ["skin-the-cat"],
    x: 50,
    y: 55,
    loadCoef: 5,
    isElite: true,
  }),
];

// Список всех ветвей в порядке отображения.
export const SKILL_BRANCHES: SkillBranch[] = [
  "pull",
  "push",
  "core",
  "legs",
  "static",
  "explosive",
  "mobility",
];
