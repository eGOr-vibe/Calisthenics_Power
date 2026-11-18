// Seed: теоретический блок из 10 разделов
// Структура соответствует типу TheoryArticle из lib/types.ts
// Контент в Markdown-формате для рендера через react-markdown.

import type { TheoryArticle } from "@/lib/types";

export const THEORY_ARTICLES: Omit<TheoryArticle, "id">[] = [
  // ====== 1. ОСНОВЫ ======
  {
    slug: "fundamentals",
    category: "intro",
    titleRu: "Основы калистеники и воркаута",
    titleEn: "Fundamentals of calisthenics & street workout",
    order: 1,
    contentRu: `## Что такое калистеника

**Калистеника** — это система тренировок, в которой сопротивлением служит масса собственного тела. Слово происходит от греческих *kallos* (красота) и *sthenos* (сила). В отличие от классического фитнеса с отягощениями, калистеника развивает **относительную силу** — способность управлять собственным телом в пространстве, а не просто поднимать внешний вес.

## Краткая история

- **Древняя Греция:** воины тренировались с весом тела — отжимания, подтягивания, прыжки. Эти упражнения входили в подготовку к олимпийским играм.
- **XIX век:** система гимнастики в Европе, шведская и немецкая школы.
- **XX век:** развитие гимнастики, акробатики, воркаута в военных подразделениях.
- **2000-е:** уличная культура воркаута в Нью-Йорке, Берлине и Москве. Появление мировых турниров (WSWC, Battle of the Bar).
- **2020-е:** калистеника как самостоятельный вид спорта с собственной методологией и научной базой.

## Отличие от фитнеса с железом

| Параметр | Калистеника | Фитнес с отягощениями |
| --- | --- | --- |
| Сопротивление | Масса тела, рычаги | Внешний вес |
| Фокус | Управление телом, навык | Изоляция мышц, объём |
| Связочный аппарат | Высокая нагрузка через длинные рычаги | Нагрузка управляемая |
| Относительная сила | Высокая | Может быть низкой |
| Кривая обучения | Нелинейная (прыжки прогрессии) | Линейная (прибавка веса) |

## Философия

- **Тело — единый инструмент.** Нет изоляции: подтягивание требует хвата, кора, спины. Каждый элемент — это интеграция.
- **Прогрессия через умение, а не вес.** Классический шаг в калистенике — не добавить 5 кг, а изменить рычаг или опору (австралийские → классические → лучника → однорукое).
- **Связки тренируются медленнее мышц.** Сухожилия и суставы адаптируются в 3-4 раза медленнее мышечной ткани. Поэтому прогрессии в калистенике — это чаще всего «скилл», а не «масса».
- **Мобильность — не побочный эффект, а фундамент.** Планш, горизонт, флажок невозможны без экстремальной подвижности плечевых суставов и грудного отдела.

## Принцип SAID

**Specific Adaptation to Imposed Demands** — тело адаптируется именно к той нагрузке, которую получает. Хочешь научиться планшу — тренируй горизонтальный жим в горизонтальном упоре, а не жим лёжа. Хочешь фронт-левер — тренируй тягу прямыми руками, а не подтягивания.

## Ключевые дисциплины

1. **Статика:** планки, горизонтальные упоры, уголки, балансы.
2. **Динамика:** подтягивания, отжимания на брусьях, мышечные-ups, фляки.
3. **Freestyle:** элементы на турнике с вращениями (skin the cat, shoulder roll, 360).
4. **Endurance:** объёмные тренировки (high-rep push-ups, pull-ups).

## Что дальше

В следующих разделах разберём:
- **Биомеханику** — рычаги, моменты, ОЦМ.
- **Кинезиологию** — мышечные группы и их функции.
- **Физиологию** — пульсовые зоны, восстановление, адаптация.
- **Прогрессивную перегрузку** — как двигаться вперёд без травм.`,
    contentEn: `## What is calisthenics

**Calisthenics** is a training system where the resistance is the mass of your own body. The word stems from Greek *kallos* (beauty) and *sthenos* (strength). Unlike classic fitness with weights, calisthenics develops **relative strength** — the ability to control your own body in space, not just to lift an external load.

## Brief history

- **Ancient Greece:** warriors trained with their body weight — push-ups, pull-ups, jumps. These exercises were part of Olympic preparation.
- **19th century:** European gymnastics systems — Swedish and German schools.
- **20th century:** gymnastics, acrobatics, military workout training.
- **2000s:** street workout culture in New York, Berlin and Moscow. Rise of world tournaments (WSWC, Battle of the Bar).
- **2020s:** calisthenics as a standalone sport with its own methodology and scientific base.

## Differences from iron fitness

| Parameter | Calisthenics | Weighted fitness |
| --- | --- | --- |
| Resistance | Body mass, levers | External weight |
| Focus | Body control, skill | Muscle isolation, volume |
| Tendon load | High via long levers | Manageable |
| Relative strength | High | May be low |
| Learning curve | Non-linear (progression jumps) | Linear (add weight) |

## Philosophy

- **The body is a single instrument.** No isolation: a pull-up demands grip, core and back. Every element is integration.
- **Progression via skill, not weight.** A typical step in calisthenics is not adding 5 kg but changing a lever or base (Australian → classic → archer → one-arm).
- **Tendons adapt slower than muscles.** Tendons and joints adapt 3-4 times slower than muscle tissue. That is why calisthenics progressions are mostly skill-based, not mass-based.
- **Mobility is a foundation, not a side effect.** Planche, lever, flag are impossible without extreme shoulder and thoracic mobility.

## The SAID principle

**Specific Adaptation to Imposed Demands** — the body adapts exactly to the load it receives. Want a planche? Train horizontal pressing in a horizontal hold, not a bench press. Want a front lever? Train straight-arm pulls, not pull-ups.

## Key disciplines

1. **Static:** planches, levers, L-sits, balances.
2. **Dynamic:** pull-ups, dips, muscle-ups, flips.
3. **Freestyle:** bar elements with rotations (skin the cat, shoulder roll, 360).
4. **Endurance:** high-rep push-ups and pull-ups.

## What's next

The next sections cover:
- **Biomechanics** — levers, moments, centre of mass.
- **Kinesiology** — muscle groups and their functions.
- **Physiology** — heart rate zones, recovery, adaptation.
- **Progressive overload** — how to advance without injury.`,
    sources: [
      "Overcoming Gravity (Steven Low)",
      "Street Workout: Manual of the WSWCF",
    ],
  },

  // ====== 2. БИОМЕХАНИКА ======
  {
    slug: "biomechanics",
    category: "biomechanics",
    titleRu: "Биомеханика",
    titleEn: "Biomechanics",
    order: 2,
    contentRu: `## Биомеханика — наука о движении

**Биомеханика** изучает механические законы, по которым движется тело человека. В калистенике без её понимания невозможно спроектировать прогрессию, понять, почему элемент не выходит, и где риск травмы.

## Рычаги

Тело работает как система рычагов. **Рычаг** — твёрдое тело, вращающееся вокруг точки опоры, на которое действуют две силы: движущая (мышца) и сопротивления (масса).

### Типы рычагов

- **Рычаг первого рода** — точка опоры между силой и сопротивлением. Пример: атлантозатылочный сустав при наклоне головы.
- **Рычаг второго рода** — сопротивление между опорой и силой. Пример: икроножная мышца при подъёме на носки. Выгодный: малая сила поднимает большой вес.
- **Рычаг треть рода** — сила между опорой и сопротивлением. Большинство движений человека. **Невыгодный**, но даёт большую скорость и амплитуду. Пример: бицепс при сгибании локтя.

В калистенике 90% движений — рычаги треть рода. Это объясняет, почему **масса тела, умноженная на длину рычага, даёт колоссальную нагрузку на мышцы и связки**.

## Момент силы

**Момент силы** *M = F × d*, где *d* — плечо силы (перпендикуляр от оси вращения до линии действия силы).

Чем длиннее плечо, тем больше момент при той же силе. Поэтому **фронт-левер с прямыми руками** даёт момент в 4-5 раз больше, чем с согнутыми. По сути, переход от tucked к advanced к full lever — это и есть изменение плеча силы.

## Общий центр масс (ОЦМ)

**ОЦМ тела** — точка, в которой сосредоточена вся масса тела. У стоящего человека находится на уровне S2-S3, чуть ниже пупка.

В калистенике управление ОЦМ — ключ к статике:

- **Планш:** ОЦМ должен быть над точкой опоры (кистями).
- **Задняя балансировка (back lever):** ОЦМ и плечи выровнены по вертикали через перекладину.
- **Handstand push-ups:** ОЦМ над кистями, голеностоп — над плечами.

Любое смещение ОЦМ за пределы опоры = падение. Поэтому в статику мы используем компенсации: ноги вперёд для баланса, прогиб в грудном отделе, разведение рук.

## Относительная сила

**Относительная сила** — сила, отнесённая к массе тела: *F_rel = F_abs / m*.

В калистенике абсолютная сила менее важна, чем относительная. Это объясняет:
- почему худые атлеты легче осваивают статические элементы (меньший момент инерции);
- почему набранная мышечная масса может **ухудшить** результаты в статику (планш, горизонт);
- почему добавление веса в подтягиваниях должно быть осознанным.

## Векторы сил и углы

При анализе движения разлагаем силу на компоненты:

- **Горизонтальная** — тянет вдоль опоры.
- **Вертикальная** — прижимает или отрывает.
- **Боковая** — вносит нестабильность.

В горизонтальном упоре большая часть веса идёт **вертикально** через плечи в кисти. Любой наклон корпуса переносит часть нагрузки на **горизонтальную** компоненту, что требует дополнительной работы плеч и спины.

## Кинематические цепи

- **Открытая цепь** — дистальный сегмент свободен (подтягивания — кисти не закреплены, движение туловища к перекладине).
- **Закрытая цепь** — дистальный сегмент закреплён (отжимания — кисти на полу, тело движется относительно них).

Закрытые цепи создают **компрессионные** силы, открытые — **сдвиговые**. Это объясняет, почему при травме плеча австралийские подтягивания (закрытая цепь) безопаснее классических.

## Применение

- **Прогрессии** — изменение длины рычага или точки опоры.
- **Защита от травм** — контроль углов и моментов.
- **Анализ формы** — где теряется эффективность.

## Резюме

Понимание биомеханики превращает калистенику из «случайных тренировок» в осознанную инженерию движения. Каждый элемент — это уравнение с плечом, моментом и ОЦМ.`,
    contentEn: `## Biomechanics — the science of movement

**Biomechanics** studies the mechanical laws that govern human movement. In calisthenics, without it you cannot design a progression, understand why an element fails, or where injury risk lies.

## Levers

The body works as a system of levers. A **lever** is a rigid body rotating around a fulcrum, acted upon by two forces: the motive (muscle) and the resistance (mass).

### Lever types

- **First-class lever** — fulcrum between force and resistance. Example: atlanto-occipital joint when nodding the head.
- **Second-class lever** — resistance between fulcrum and force. Example: calf during a toe raise. Advantageous: small force lifts large weight.
- **Third-class lever** — force between fulcrum and resistance. Most human movements. **Disadvantageous** but yields speed and range. Example: biceps during elbow flexion.

In calisthenics, 90% of movements are third-class levers. This explains why **body mass multiplied by lever length creates a colossal load on muscles and tendons**.

## Moment of force

**Moment of force** *M = F × d*, where *d* is the moment arm (perpendicular from the rotation axis to the line of force action).

The longer the arm, the greater the moment at equal force. That is why **a front lever with straight arms** produces a moment 4-5 times larger than with bent arms. The progression from tucked to advanced to full lever is essentially a change in the moment arm.

## Centre of mass (COM)

**COM of the body** is the point where all body mass is concentrated. In a standing person it lies at the level of S2-S3, slightly below the navel.

In calisthenics, COM control is the key to statics:

- **Planche:** COM must be above the support (hands).
- **Back lever:** COM and shoulders aligned vertically through the bar.
- **Handstand push-ups:** COM above hands, ankles above shoulders.

Any shift of COM outside the support = a fall. That is why in statics we use compensations: legs forward for balance, thoracic extension, arms spread.

## Relative strength

**Relative strength** is force normalised to body mass: *F_rel = F_abs / m*.

In calisthenics absolute strength is less important than relative. This explains:
- why lean athletes learn static elements more easily (smaller moment of inertia);
- why added muscle mass can **worsen** static results (planche, lever);
- why adding weight to pull-ups must be conscious.

## Force vectors and angles

When analysing a movement, we decompose force into components:

- **Horizontal** — pulls along the support.
- **Vertical** — presses or releases.
- **Lateral** — introduces instability.

In a horizontal hold, most weight goes **vertically** through the shoulders into the hands. Any tilt of the torso shifts part of the load to the **horizontal** component, requiring extra work from shoulders and back.

## Kinematic chains

- **Open chain** — distal segment is free (pull-ups: hands not fixed, body moves toward the bar).
- **Closed chain** — distal segment is fixed (push-ups: hands on the floor, body moves relative to them).

Closed chains create **compressive** forces; open chains create **shear** forces. This explains why Australian pull-ups (closed chain) are safer for shoulder injuries than classic ones.

## Application

- **Progressions** — change lever length or support point.
- **Injury prevention** — control angles and moments.
- **Form analysis** — where efficiency is lost.

## Summary

Understanding biomechanics turns calisthenics from "random training" into conscious movement engineering. Every element is an equation with a lever arm, a moment and the COM.`,
    sources: [
      "Biomechanics of Movement (Hamill, Knutzen)",
      "Overcoming Gravity (Steven Low)",
    ],
  },

  // ====== 3. КИНЕЗИОЛОГИЯ ======
  {
    slug: "kinesiology",
    category: "kinesiology",
    titleRu: "Кинезиология",
    titleEn: "Kinesiology",
    order: 3,
    contentRu: `## Что изучает кинезиология

**Кинезиология** — наука о движении тела, охватывающая анатомию мышц, их функции, типы сокращений и закономерности активации. В отличие от биомеханики, кинезиология смотрит на движение через призму мышечной работы.

## Типы мышечных сокращений

- **Концентрическое** — мышца укорачивается, преодолевая сопротивление (подъём в подтягивании).
- **Эксцентрическое** — мышца удлиняется под нагрузкой (опускание в подтягивании). Генерирует на 20-40% больше силы, чем концентрическое, при той же нейромышечной активности.
- **Изометрическое** — длина мышцы постоянна, суставы не движутся (удержание горизонта).
- **Плиометрическое** — эксцентрический «подрыв» с быстрым переходом в концентрическое (отжимания с хлопком).

В калистенике особенно важен **эксцентрический режим**: медленное опускание в новой прогрессии даёт до 60% тренировочного эффекта при меньшем риске травмы.

## Типы мышечных волокон

| Тип | Свойства | Функция |
| --- | --- | --- |
| **I (медленные, окислительные)** | Устойчивы к утомлению, малая сила | Длительная работа, кор |
| **IIa (промежуточные)** | Средняя сила и усталость | Большинство движений |
| **IIx (быстрые, гликолитические)** | Большая сила, быстрая утомляемость | Взрывные движения, статики |

Распределение волокон генетически задано (примерно 50/50 у нетренированных). Тренировки сдвигают IIx в сторону IIa, но не превращают I в II и наоборот. Это объясняет, почему у одних лучше статика, у других — выносливость.

## Основные мышечные группы

### Тяги (pull)

- **Широчайшая мышца спины** — основной разгибатель плеча и приведение. Двусуставная (плечо + лопатка).
- **Большая круглая** — ассистент широчайшей.
- **Трапециевидная (нижняя и средняя части)** — стабилизация лопатки, опускание плеч.
- **Ромбовидные** — приведение лопатки к позвоночнику.
- **Бицепс плеча** — сгибание локтя, супинация. Двусуставная (плечо + локоть), что делает его уязвимым при перегрузке.
- **Предплечья (флексоры пальцев)** — удержание хвата.

### Жимы (push)

- **Большая грудная** — приведение и горизонтальное сгибание плеча.
- **Передняя дельта** — сгибание плеча.
- **Трицепс** — разгибание локтя. Двусуставная (преодолевает локоть и плечо).
- **Передняя зубчатая** — отведение лопатки от грудной клетки (в handstand и плане).
- **Средняя и задняя дельты** — отведение и разгибание плеча.

### Кор (core)

- **Прямая мышца живота** — сгибание туловища, контроль таза.
- **Поперечная мышца живота** — внутрибрюшное давление, стабилизация позвоночника.
- **Внутренние и наружные косые** — вращение и наклоны.
- **Разгибатели спины (выпрямитель туловища)** — разгибание туловища, контроль прогиба.
- **Подвздошно-поясничная** — сгибание тазобедренного сустава (L-sit).

### Ноги (legs)

- **Квадрицепс** — разгибание колена.
- **Ягодичные** — разгибание и отведение бедра.
- **Задняя поверхность бедра** — сгибание колена, разгибание таза. Двусуставная.
- **Икроножная и камбаловидная** — подошвенное сгибание.

## Двусуставные мышцы — критично

Двусуставные мышцы пересекают два сустава и могут работать в **парадоксальных режимах** (Lombard's paradox):

- **Бицепс бедра** — разгибает таз и сгибает колено.
- **Прямая мышца бедра** — сгибает таз и разгибает колено.
- **Бицепс плеча** — сгибает локоть и помогает сгибать плечо.
- **Длинная головка трицепса** — разгибает локоть и помогает разгибать плечо.

В приседе бицепс бедра и прямая мышца бедра работают **одновременно** — это и есть парадокс Ломбарда. Это критично понимать для калистеники: при горизонтальном упоре длинная голова трицепса перегружается, потому что одновременно разгибает и локоть, и плечо.

## Закономерности активации

- **Закон All-or-Nothing** — мышечное волокно либо сокращается полностью, либо нет.
- **Принцип размера (Henneman)** — сначала рекрутируются малые (I), затем средние (IIa), затем большие (IIx) волокна. По мере роста силы активируются высокопороговые волокна.
- **Частота импульсации (rate coding)** — рост силы также за счёт увеличения частоты разрядов мотонейронов.

## Мышцы-синергисты и антагонисты

В любом движении есть:

- **Агонисты** — основные движители.
- **Синергисты** — помощники.
- **Антагонисты** — противоположные мышцы.
- **Стабилизаторы** — фиксируют сустав.

В подтягивании: агонист — широчайшая, синергист — бицепс, антагонист — трицепс (растягивается), стабилизаторы — трапеция и ромбовидные.

## Резюме

Кинезиология даёт «карту» мышц и сокращений. Без неё непонятно, что именно тренируешь. С ней — каждый подход становится адресным воздействием.`,
    contentEn: `## What kinesiology studies

**Kinesiology** is the science of body movement, covering muscle anatomy, function, contraction types and activation patterns. Unlike biomechanics, kinesiology views movement through the lens of muscular work.

## Types of muscular contraction

- **Concentric** — muscle shortens, overcoming resistance (the upward phase of a pull-up).
- **Eccentric** — muscle lengthens under load (the downward phase). Produces 20-40% more force than concentric at the same neuromuscular activity.
- **Isometric** — muscle length constant, joints do not move (lever hold).
- **Plyometric** — eccentric "pre-load" with rapid switch to concentric (clapping push-up).

In calisthenics the **eccentric** mode is especially important: a slow descent in a new progression yields up to 60% of the training effect at lower injury risk.

## Muscle fibre types

| Type | Properties | Function |
| --- | --- | --- |
| **I (slow oxidative)** | Fatigue-resistant, low force | Endurance work, core |
| **IIa (intermediate)** | Medium force and fatigue | Most movements |
| **IIx (fast glycolytic)** | High force, fast fatigue | Explosive movements, statics |

Fibre distribution is genetically set (about 50/50 in untrained). Training shifts IIx toward IIa, but does not convert I to II or vice versa. This explains why some excel at statics and others at endurance.

## Main muscle groups

### Pull

- **Latissimus dorsi** — prime shoulder extensor and adductor. Biarticular (shoulder + scapula).
- **Teres major** — lat assistant.
- **Trapezius (lower and middle)** — scapular stabilisation, shoulder depression.
- **Rhomboids** — scapular retraction.
- **Biceps brachii** — elbow flexion, supination. Biarticular (shoulder + elbow), making it vulnerable to overload.
- **Forearms (finger flexors)** — grip.

### Push

- **Pectoralis major** — shoulder adduction and horizontal flexion.
- **Anterior deltoid** — shoulder flexion.
- **Triceps** — elbow extension. Biarticular (elbow + shoulder).
- **Serratus anterior** — scapular protraction (handstand, planche).
- **Middle and posterior deltoids** — shoulder abduction and extension.

### Core

- **Rectus abdominis** — trunk flexion, pelvic control.
- **Transversus abdominis** — intra-abdominal pressure, spinal stabilisation.
- **Internal and external obliques** — rotation and lateral flexion.
- **Erector spinae** — trunk extension, arch control.
- **Iliopsoas** — hip flexion (L-sit).

### Legs

- **Quadriceps** — knee extension.
- **Gluteals** — hip extension and abduction.
- **Hamstrings** — knee flexion, hip extension. Biarticular.
- **Gastrocnemius and soleus** — plantar flexion.

## Biarticular muscles — critical

Biarticular muscles cross two joints and can act in **paradoxical modes** (Lombard's paradox):

- **Hamstrings** — extend the hip and flex the knee.
- **Rectus femoris** — flexes the hip and extends the knee.
- **Biceps brachii** — flexes the elbow and helps flex the shoulder.
- **Long head of triceps** — extends the elbow and helps extend the shoulder.

In a squat, hamstrings and rectus femoris work **simultaneously** — that is Lombard's paradox. In calisthenics this matters: in a horizontal hold, the long head of triceps is overloaded because it extends both elbow and shoulder at once.

## Activation patterns

- **All-or-Nothing law** — a fibre contracts fully or not at all.
- **Size principle (Henneman)** — small (I) fibres are recruited first, then IIa, then IIx. As strength grows, high-threshold fibres are recruited.
- **Rate coding** — strength also grows through increased motoneuron firing rate.

## Synergists and antagonists

In any movement there are:

- **Agonists** — prime movers.
- **Synergists** — assistants.
- **Antagonists** — opposing muscles.
- **Stabilisers** — fix the joint.

In a pull-up: agonist — lats, synergist — biceps, antagonist — triceps (stretched), stabilisers — traps and rhomboids.

## Summary

Kinesiology gives the "map" of muscles and contractions. Without it you don't know what you are training. With it, every set becomes targeted impact.`,
    sources: [
      "Kinesiology of the Musculoskeletal System (Neumann)",
      "Strength Training Anatomy (F. Delavier)",
    ],
  },

  // ====== 4. ФИЗИОЛОГИЯ ======
  {
    slug: "physiology",
    category: "physiology",
    titleRu: "Физиология",
    titleEn: "Physiology",
    order: 4,
    contentRu: `## Физиология тренировок

**Физиология** изучает, как организм отвечает на нагрузку и адаптируется к ней. В калистенике это знание позволяет планировать объём, интенсивность и восстановление.

## Энергетические системы

| Система | Топливо | Время работы | Когда |
| --- | --- | --- | --- |
| **АТФ-КФ (фосфагенная)** | Креатин-фосфат | 0-10 сек | Максимальные усилия, статика 5-10 сек |
| **Гликолитическая (лактатная)** | Глюкоза (без O2) | 10 сек - 2 мин | Круговые тренировки, ВИИТ |
| **Окислительная (аэробная)** | Глюкоза + жиры (с O2) | > 2 мин | Длинные объёмные сессии |

В калистенике все три системы работают вместе. **АТФ-КФ** критична для статики (планш, горизонт — 5-15 сек). **Гликолитическая** — для ВИИТ-таймеров. **Окислительная** — для длинных тренировок и восстановления.

Креатин-фосфат восстанавливается на 90% за 3-5 минут отдыха. Поэтому между максимальными статическими попытками рекомендуется 3-5 минутный отдых.

## Пульсовые зоны

- **Z1 (50-60% ЧССмакс)** — восстановление, активная регенерация.
- **Z2 (60-70%)** — аэробная база, жир как топливо.
- **Z3 (70-80%)** — аэробная выносливость, лактат начинает расти.
- **Z4 (80-90%)** — анаэробный порог, лактат накапливается.
- **Z5 (90-100%)** — пик анаэробной мощности.

ЧССмакс ≈ 220 - возраст (приближённая формула). У тренированных атлетов ЧСС покоя снижается до 40-50 уд/мин — признак эффективной сердечной мышцы.

Для калистеники:
- **Силовые/статические тренировки:** Z2-Z3 (110-150 уд/мин) с пиками в Z4.
- **ВИИТ-таймеры:** Z4-Z5 (160-190 уд/мин) с отдыхом до Z2.
- **Восстановление:** Z1 (90-110 уд/мин).

## HRV — вариабельность сердечного ритма

**HRV (Heart Rate Variability)** — вариация интервалов между ударами сердца. Высокая HRV = хорошая парасимпатическая активность = готовность к нагрузке. Низкая HRV = накопленный стресс, лучше отдых.

Основные метрики:

- **RMSSD** — корень из среднеквадратичных разностей соседних интервалов. Чувствителен к парасимпатике.
- **LF/HF** — отношение низкочастотной к высокочастотной компоненте. Индикатор баланса ВНС.

Тренированный организм: RMSSD 50-100 мс. Перетренированность: < 30 мс. Используется для принятия решения «тренироваться сегодня или нет».

## Суперкомпенсация

После тренировки ресурс (гликоген, ферменты, нервная проводимость) **снижается**. Затем в фазе восстановления организм не просто возвращается к исходному уровню, а **превышает его**. Это и есть суперкомпенсация.

График: нагрузка → спад → восстановление → пик (через 24-72 часа) → возврат к базе.

Если следующая тренировка попадает в пик суперкомпенсации — рост. Если раньше — переутомление. Если позже — стагнация.

## Адаптация тканей

| Ткань | Время адаптации | Механизм |
| --- | --- | --- |
| Нервная система | 1-3 недели | Рекрутирование двигательных единиц |
| Мышцы | 4-8 недель | Гипертрофия волокон |
| Соединительная ткань | 3-6 месяцев | Ремоделирование коллагена |
| Кость | 6-12 месяцев | Минерализация |

Это объясняет, почему **через 2-3 недели сила растёт заметно, а через месяц — стабилизируется**: на этом этапе идёт не столько нервная, сколько мышечная адаптация. И именно поэтому связки повреждаются чаще, чем мышцы: их адаптация в 4-5 раз медленнее.

## Восстановление

### Виды восстановления

- **Острое** — минуты/часы после тренировки (восстановление АТФ, лактат).
- **Краткосрочное** — 24-72 часа (мышечный гликоген, белковый синтез).
- **Долгосрочное** — недели/месяцы (связки, кость, гормональная ось).

### Стресс и анаболизм

Гормоны, влияющие на рост:

- **Тестостерон** — анаболизм мышц. Пик утром, после сна и силовой работы.
- **Кортизол** — катаболизм. Высок при стрессе и недосыпе. Подавляет тестостерон.
- **Гормон роста (GH)** — восстановление и рост. Секретируется во сне.
- **IGF-1** — медиатор гормона роста, синтезируется в печени.

Недостаток сна (менее 7 часов) снижает тестостерон на 10-15%, GH — на 50-70%.

## Перетренированность

Симптомы:

- Повышение утреннего пульса на 5+ ударов.
- Снижение HRV на 20%+.
- Падение силы на 10%+.
- Нарушения сна, раздражительность.
- Частые инфекции (снижение иммунитета).

Лечение — отдых 1-2 недели с лёгкой активностью (Z1) и сном 9+ часов.

## Резюме

Физиология превращает «тренировку» в **цикл нагрузки-восстановления-адаптации**. Без её понимания невозможно построить долгосрочную прогрессию и избежать перетренированности.`,
    contentEn: `## Training physiology

**Physiology** studies how the body responds to load and adapts to it. In calisthenics this knowledge lets you plan volume, intensity and recovery.

## Energy systems

| System | Fuel | Duration | When |
| --- | --- | --- | --- |
| **ATP-CP (phosphagen)** | Creatine phosphate | 0-10 sec | Maximal efforts, 5-10 sec statics |
| **Glycolytic (lactate)** | Glucose (no O2) | 10 sec - 2 min | Circuit training, HIIT |
| **Oxidative (aerobic)** | Glucose + fat (with O2) | > 2 min | Long volume sessions |

In calisthenics all three work together. **ATP-CP** is critical for statics (planche, lever — 5-15 sec). **Glycolytic** for HIIT timers. **Oxidative** for long sessions and recovery.

Creatine phosphate recovers 90% in 3-5 minutes of rest. That is why 3-5 minute rest is recommended between maximal static attempts.

## Heart rate zones

- **Z1 (50-60% HRmax)** — recovery, active regeneration.
- **Z2 (60-70%)** — aerobic base, fat as fuel.
- **Z3 (70-80%)** — aerobic endurance, lactate begins to rise.
- **Z4 (80-90%)** — anaerobic threshold, lactate accumulates.
- **Z5 (90-100%)** — peak anaerobic power.

HRmax ≈ 220 - age (approximate formula). Trained athletes have resting HR down to 40-50 bpm — a sign of efficient cardiac muscle.

For calisthenics:
- **Strength/static training:** Z2-Z3 (110-150 bpm) with peaks in Z4.
- **HIIT timers:** Z4-Z5 (160-190 bpm) with rest down to Z2.
- **Recovery:** Z1 (90-110 bpm).

## HRV — heart rate variability

**HRV (Heart Rate Variability)** is the variation between heartbeats. High HRV = good parasympathetic activity = ready to train. Low HRV = accumulated stress, better rest.

Key metrics:

- **RMSSD** — root mean square of successive differences. Sensitive to parasympathetics.
- **LF/HF** — ratio of low to high frequency components. ANS balance indicator.

Trained: RMSSD 50-100 ms. Overtrained: < 30 ms. Used to decide "train today or not".

## Supercompensation

After training the resource (glycogen, enzymes, neural conduction) **drops**. Then in recovery the body not only returns to baseline but **exceeds it**. That is supercompensation.

Curve: load → drop → recovery → peak (24-72 hours) → return to baseline.

If the next training hits the supercompensation peak — growth. Earlier — overreaching. Later — stagnation.

## Tissue adaptation

| Tissue | Adaptation time | Mechanism |
| --- | --- | --- |
| Nervous system | 1-3 weeks | Motor unit recruitment |
| Muscles | 4-8 weeks | Fibre hypertrophy |
| Connective tissue | 3-6 months | Collagen remodelling |
| Bone | 6-12 months | Mineralisation |

This explains why strength grows noticeably in 2-3 weeks but stabilises in a month: at that point it is no longer neural but muscular adaptation. It also explains why tendons injure more often than muscles: their adaptation is 4-5 times slower.

## Recovery

### Recovery types

- **Acute** — minutes/hours after training (ATP restoration, lactate).
- **Short-term** — 24-72 hours (muscle glycogen, protein synthesis).
- **Long-term** — weeks/months (tendons, bone, hormonal axis).

### Stress and anabolism

Hormones affecting growth:

- **Testosterone** — muscle anabolism. Peaks in the morning, after sleep and strength work.
- **Cortisol** — catabolism. High under stress and sleep deprivation. Suppresses testosterone.
- **Growth hormone (GH)** — recovery and growth. Secreted during sleep.
- **IGF-1** — GH mediator, synthesised in the liver.

Sleep deficit (under 7 hours) lowers testosterone by 10-15%, GH by 50-70%.

## Overtraining

Symptoms:

- Resting HR elevated by 5+ bpm.
- HRV down 20%+.
- Strength down 10%+.
- Sleep disturbances, irritability.
- Frequent infections (lowered immunity).

Treatment — 1-2 weeks rest with light activity (Z1) and 9+ hours sleep.

## Summary

Physiology turns "training" into a **load-recovery-adaptation cycle**. Without it you cannot build long-term progression or avoid overtraining.`,
    sources: [
      "Physiology of Sport and Exercise (Wilmore, Costill)",
      "Supertraining (Y. Verkhoshansky, M. Siff)",
    ],
  },

  // ====== 5. ПРОГРЕССИВНАЯ ПЕРЕГРУЗКА ======
  {
    slug: "progressive-overload",
    category: "training-principles",
    titleRu: "Прогрессивная перегрузка",
    titleEn: "Progressive overload",
    order: 5,
    contentRu: `## Суть прогрессивной перегрузки

**Прогрессивная перегрузка** — базовый принцип тренировок: чтобы прогрессировать, нагрузка должна систематически возрастать. Без этого адаптация останавливается.

## Виды перегрузки

В калистенике доступны следующие инструменты:

- **Увеличение объёма** — больше повторений, подходов, раундов.
- **Увеличение интенсивности** — переход к более сложной прогрессии (планш tucked → advanced → straddle → full).
- **Уменьшение отдыха** — сокращение пауз между подходами.
- **Увеличение рычага** — выпрямление ног, изменение угла.
- **Добавление внешнего веса** — жилет, цепь, гиря (для динамики).
- **Усложнение темпа** — паузы в нижней точке, медленное опускание.

## Объём vs Интенсивность

- **Объём** = подходы × повторения × нагрузка. Растёт в фазе гипертрофии.
- **Интенсивность** = близость к 1ПМ или сложность прогрессии. Растёт в фазе силы.

Для калистеники действует правило: **сначала объём, потом сложность**. Прежде чем перейти к лучнику, ты должен делать 8-10 чистых классических. Прежде чем к однорукому — 8-10 лучника на каждую сторону.

## Принцип двойной прогрессии

Классический подход:

1. **Диапазон повторений** — например, 3 подхода по 5-8.
2. **Усложнение** — как только достигаешь верхнего предела (8) во всех подходах, переходишь к следующей прогрессии.

Пример:

- Неделя 1: 5-5-5
- Неделя 2: 6-6-5
- Неделя 3: 7-6-6
- Неделя 4: 8-8-8 → переход к следующей прогрессии.

## Частота тренировок

| Цель | Частота на мышечную группу |
| --- | --- |
| Сила | 2-3 раза в неделю |
| Гипертрофия | 2-3 раза в неделю |
| Выносливость | 3-4 раза в неделю |
| Статика (скилл) | 4-6 раз в неделю (малый объём) |

**Grease the Groove (GTG)** — метод Павла Цацулина: 5-10 подходов в течение дня, далеко от отказа. Идеально для навыковых статических элементов.

## Закон специфичности (SAID)

Specific Adaptation to Imposed Demands — тело адаптируется к тому, что делаешь. Хочешь статичный планш — тренируй статику, а не жим лёжа. Хочешь фляк — тренируй фляк, а не просто прыжки.

## Делиярация и периодизация

Без планирования прогресс остановится через 6-8 недель. Используется периодизация:

- **Микроцикл** — 1 неделя.
- **Мезоцикл** — 4-8 недель (например, силовой, объёмный, восстановительный).
- **Макроцикл** — 3-12 месяцев (соревновательный, Off-season).

Пример 8-недельного мезо:

- Недели 1-3: объёмная фаза (3×8-12).
- Недели 4-6: силовая фаза (5×3-5).
- Неделя 7: разгрузка (объём -40%).
- Неделя 8: тест нового максимума.

## Отказ — инструмент, не правило

Тренировки до отказа каждую сессию приводят к:

- Повышению кортизола.
- Снижению ЦНС-возбудимости.
- Росту риска травмы.

Используй отказ **не чаще 1 раза в неделю** на одно движение. Большинство подходов — за 1-2 повторения до отказа (RIR 1-2).

## RPE и RIR

- **RPE** (Rate of Perceived Exertion) — субъективная оценка тяжести по 10-балльной шкале. Целевая для силы — 8-9.
- **RIR** (Reps in Reserve) — сколько повторений осталось до отказа. Цель — 1-3.

## Логирование

Без записи прогресса невозможно увидеть паттерны. Минимум:

- Дата.
- Упражнение.
- Подходы × повторения.
- RPE/RIR.
- Сон, настроение, HRV (если есть).

В Calisthenics Power это делается автоматически через историю тренировок.

## Резюме

Прогрессивная перегрузка — не «добраться до отказа», а **систематическое, измеримое и обратимое** увеличение стимула. Каждый шаг логируется, каждый переход осознан.`,
    contentEn: `## The essence of progressive overload

**Progressive overload** is the foundational training principle: to progress, load must systematically increase. Without it adaptation stalls.

## Overload types

In calisthenics the following tools are available:

- **Volume increase** — more reps, sets, rounds.
- **Intensity increase** — moving to a harder progression (tucked → advanced → straddle → full planche).
- **Rest decrease** — shorter pauses between sets.
- **Lever increase** — straightening legs, changing angle.
- **External weight** — vest, chain, kettlebell (for dynamic work).
- **Tempo complexity** — pauses at the bottom, slow descent.

## Volume vs Intensity

- **Volume** = sets × reps × load. Grows in hypertrophy phase.
- **Intensity** = proximity to 1RM or progression difficulty. Grows in strength phase.

For calisthenics the rule is: **first volume, then complexity**. Before moving to archer pull-ups you must do 8-10 clean classics. Before one-arm — 8-10 archers each side.

## Double progression principle

Classic approach:

1. **Rep range** — e.g. 3 sets of 5-8.
2. **Progression** — once you hit the upper bound (8) in all sets, move to the next progression.

Example:

- Week 1: 5-5-5
- Week 2: 6-6-5
- Week 3: 7-6-6
- Week 4: 8-8-8 → move to next progression.

## Training frequency

| Goal | Frequency per muscle group |
| --- | --- |
| Strength | 2-3 times per week |
| Hypertrophy | 2-3 times per week |
| Endurance | 3-4 times per week |
| Static (skill) | 4-6 times per week (low volume) |

**Grease the Groove (GTG)** — Pavel Tsatsouline's method: 5-10 sets throughout the day, far from failure. Ideal for skill-based static elements.

## Specificity (SAID)

Specific Adaptation to Imposed Demands — the body adapts to what you do. Want a static planche? Train static planche, not bench press. Want a flip? Train flips, not just jumps.

## Periodisation

Without planning, progress stalls in 6-8 weeks. Use periodisation:

- **Microcycle** — 1 week.
- **Mesocycle** — 4-8 weeks (e.g. strength, volume, recovery).
- **Macrocycle** — 3-12 months (competition, off-season).

Example 8-week meso:

- Weeks 1-3: volume phase (3×8-12).
- Weeks 4-6: strength phase (5×3-5).
- Week 7: deload (volume -40%).
- Week 8: test new max.

## Failure — a tool, not a rule

Training to failure every session leads to:

- Elevated cortisol.
- Reduced CNS excitability.
- Increased injury risk.

Use failure **no more than once per week** per movement. Most sets stay 1-2 reps shy of failure (RIR 1-2).

## RPE and RIR

- **RPE** (Rate of Perceived Exertion) — subjective effort on a 10-point scale. Target for strength: 8-9.
- **RIR** (Reps in Reserve) — how many reps you have left before failure. Target: 1-3.

## Logging

Without recording progress you cannot see patterns. Minimum:

- Date.
- Exercise.
- Sets × reps.
- RPE/RIR.
- Sleep, mood, HRV (if available).

In Calisthenics Power this is automated through training history.

## Summary

Progressive overload is not "reach failure" but a **systematic, measurable and reversible** increase of stimulus. Every step is logged, every transition is conscious.`,
    sources: [
      "Scientific Principles of Hypertrophy Training (M. Israetel)",
      "Power to the People (Pavel Tsatsouline)",
    ],
  },

  // ====== 6. ПИТАНИЕ И ДОБАВКИ ======
  {
    slug: "nutrition",
    category: "nutrition",
    titleRu: "Питание и добавки",
    titleEn: "Nutrition and supplements",
    order: 6,
    contentRu: `## Питание — фундамент прогресса

Тренировки дают **стимул**, а питание — **материал** для адаптации. Без правильного питания тренировочный эффект будет минимальным.

## Калорический баланс

- **Поддержание** — калории = расход. Подходит для фазы силы.
- **Профицит** — калории > расхода. Гипертрофия, рост массы.
- **Дефицит** — калории < расхода. Похудение, рельеф.

В калистенике избыток массы ухудшает относительную силу. Поэтому **излишний профицит не нужен** — достаточно +200-300 ккал в фазе гипертрофии.

## Макронутриенты

### Белки

- **Норма:** 1.6-2.2 г на кг массы тела для тренированных.
- **Источники:** яйца, курица, рыба, творог, бобовые.
- **Тайминг:** 20-40 г белка за приём, 4-5 приёмов в день оптимизируют синтез белка.

### Углеводы

- **Норма:** 3-7 г на кг, в зависимости от объёма.
- **Источники:** овсянка, рис, картофель, фрукты.
- **Тайминг:** 1-2 г на кг за 2-3 часа до тренировки; 0.5-1 г на кг в течение 30 мин после.

### Жиры

- **Норма:** 0.8-1.3 г на кг, минимум.
- **Источники:** оливковое масло, орехи, авокадо, жирная рыба (Омега-3).
- **Важно:** жиры поддерживают гормональную ось (тестостерон, GH).

## Гидратация

| Состояние | Потребность |
| --- | --- |
| Покой | 30-35 мл/кг |
| Тренировка до 1 ч | +500-700 мл |
| Тренировка 1-2 ч | +700-1500 мл |
| Жаркий климат | +500-1000 мл |

Дегидратация на 2% массы тела снижает силу на 5-10% и когнитивные функции на 10-15%. Проверка: цвет мочи — соломенно-жёлтый, тёмный — признак дегидратации.

## Электролиты

При длительных сессиях (90+ мин) и обильном потоотделении важно восполнять:

- **Натрий** — 300-700 мг/час тренировки.
- **Калий** — 100-300 мг/час.
- **Магний** — 200-400 мг/день.

Дефицит магния проявляется судорогами, нарушениями сна и снижением HRV.

## Ключевые добавки

### Креатин моногидрат

- **Доза:** 3-5 г ежедневно, без фазы загрузки.
- **Эффект:** +5-15% максимальной силы, рост объёма мышц через воду.
- **Механизм:** повышает запас фосфокреатина → больше АТФ в фосфагенной системе.
- **Доказательность:** A-класс, более 500 исследований.

### Протеин (сывороточный)

- **Доза:** 20-40 г при необходимости закрыть дневную норму.
- **Эффект:** удобство, не магия.
- **Когда:** после тренировки или как перекус.

### Омега-3 (EPA+DHA)

- **Доза:** 1-2 г EPA+DHA в день.
- **Эффект:** противовоспалительное, здоровье суставов, поддержка сердечно-сосудистой системы.

### Витамин D

- **Доза:** 1000-4000 МЕ/день (зимой — выше).
- **Эффект:** иммунитет, тестостерон, костная плотность.
- **Дефицит:** у 60-80% жителей северных широт.

### Магний (цитрат или глицинат)

- **Доза:** 200-400 мг, лучше вечером.
- **Эффект:** сон, восстановление, профилактика судорог.

### Цинк

- **Доза:** 10-20 мг/день.
- **Эффект:** иммунитет, тестостерон.

## Что НЕ работает

- **BCAA** — если белок в рационе достаточен, добавки бессмысленны.
- **Жиросжигатели** — маркетинг, эффективность ~0.
- **Предтреники** — часто избыточный кофеин + дешёвые ингредиенты. Лучше отдельно кофеин (100-200 мг) за 30 минут до тренировки.

## Вегетарианство и веганство

Возможно, но требует внимания:

- Полноценные белки: соя, киноа, гречка + бобовые.
- Витамин B12 — обязательная добавка.
- Железо — растительное усваивается хуже; комбинировать с витамином C.
- Креатин — в растительной диете отсутствует; добавка 5 г/день даёт выраженный эффект.

## Тайминг питания

- **За 2-3 часа:** полноценный приём (белки + сложные углеводы).
- **За 30-60 мин:** лёгкий перекус (банан + белок).
- **Во время:** вода; при сессиях 90+ мин — изотоник.
- **В течение 30-60 мин после:** белок + углеводы 1:2.

## Резюме

Питание — это не «магия», а инженерия. Калории, макронутриенты, гидратация — база. Добавки точечно усиливают, но не заменяют.`,
    contentEn: `## Nutrition — the foundation of progress

Training provides the **stimulus**, nutrition provides the **material** for adaptation. Without proper nutrition the training effect is minimal.

## Caloric balance

- **Maintenance** — calories = expenditure. Suitable for strength phases.
- **Surplus** — calories > expenditure. Hypertrophy, mass gain.
- **Deficit** — calories < expenditure. Fat loss, definition.

In calisthenics excess mass reduces relative strength. So **excessive surplus is unnecessary** — +200-300 kcal in hypertrophy phases is enough.

## Macronutrients

### Protein

- **Norm:** 1.6-2.2 g per kg body weight for trained individuals.
- **Sources:** eggs, chicken, fish, cottage cheese, legumes.
- **Timing:** 20-40 g per meal, 4-5 meals per day optimise protein synthesis.

### Carbohydrates

- **Norm:** 3-7 g per kg, depending on volume.
- **Sources:** oats, rice, potatoes, fruits.
- **Timing:** 1-2 g per kg 2-3 hours before training; 0.5-1 g per kg within 30 min after.

### Fats

- **Norm:** 0.8-1.3 g per kg minimum.
- **Sources:** olive oil, nuts, avocado, fatty fish (Omega-3).
- **Important:** fats support the hormonal axis (testosterone, GH).

## Hydration

| State | Need |
| --- | --- |
| Rest | 30-35 ml/kg |
| Training under 1 h | +500-700 ml |
| Training 1-2 h | +700-1500 ml |
| Hot climate | +500-1000 ml |

Dehydration of 2% body mass reduces strength by 5-10% and cognitive function by 10-15%. Check: urine colour — straw yellow; dark indicates dehydration.

## Electrolytes

For long sessions (90+ min) and heavy sweating, replenish:

- **Sodium** — 300-700 mg/hour of training.
- **Potassium** — 100-300 mg/hour.
- **Magnesium** — 200-400 mg/day.

Magnesium deficiency shows as cramps, sleep disorders and reduced HRV.

## Key supplements

### Creatine monohydrate

- **Dose:** 3-5 g daily, no loading phase.
- **Effect:** +5-15% maximal strength, muscle volume via water.
- **Mechanism:** raises phosphocreatine stores → more ATP in the phosphagen system.
- **Evidence:** A-class, 500+ studies.

### Whey protein

- **Dose:** 20-40 g to meet daily norm.
- **Effect:** convenience, not magic.
- **When:** post-workout or as a snack.

### Omega-3 (EPA+DHA)

- **Dose:** 1-2 g EPA+DHA daily.
- **Effect:** anti-inflammatory, joint health, cardiovascular support.

### Vitamin D

- **Dose:** 1000-4000 IU/day (higher in winter).
- **Effect:** immunity, testosterone, bone density.
- **Deficiency:** in 60-80% of northern latitudes residents.

### Magnesium (citrate or glycinate)

- **Dose:** 200-400 mg, best in the evening.
- **Effect:** sleep, recovery, cramp prevention.

### Zinc

- **Dose:** 10-20 mg/day.
- **Effect:** immunity, testosterone.

## What does NOT work

- **BCAA** — if dietary protein is sufficient, supplementation is pointless.
- **Fat burners** — marketing, effectiveness ~0.
- **Pre-workouts** — often excess caffeine + cheap ingredients. Better: separate caffeine (100-200 mg) 30 min before training.

## Vegetarian and vegan

Possible, but requires attention:

- Complete proteins: soy, quinoa, buckwheat + legumes.
- Vitamin B12 — mandatory supplement.
- Iron — plant-based is less bioavailable; combine with vitamin C.
- Creatine — absent in plant-based diet; 5 g/day supplementation produces pronounced effect.

## Nutrient timing

- **2-3 hours before:** full meal (protein + complex carbs).
- **30-60 min before:** light snack (banana + protein).
- **During:** water; for sessions 90+ min — isotonic drink.
- **Within 30-60 min after:** protein + carbs 1:2.

## Summary

Nutrition is not "magic" but engineering. Calories, macronutrients, hydration — the base. Supplements amplify specifically but do not replace.`,
    sources: [
      "ISSN Position Stands (creatine, protein, etc.)",
      "The Renaissance Diet (M. Israetel)",
    ],
  },

  // ====== 7. ТРЕНИРОВОЧНЫЕ КОНЦЕПЦИИ ======
  {
    slug: "training-concepts",
    category: "methodology",
    titleRu: "Тренировочные концепции",
    titleEn: "Training concepts",
    order: 7,
    contentRu: `## Классификация форматов

В калистенике применяется несколько десятков форматов. Calisthenics Power поддерживает четыре основных:

## AMRAP

**As Many Rounds As Possible** — за фиксированное время выполнить максимум кругов заданной схемы.

- **Пример:** 20 минут AMRAP: 5 подтягиваний + 10 отжиманий + 15 приседаний.
- **Цель:** выносливость, объём.
- **Пульсовая зона:** Z4-Z5.
- **Риск:** высокий, если схема несбалансирована. Локальное утомление плечевого пояса.

## EMOM

**Every Minute On the Minute** — каждую минуту выполняешь заданное количество повторений, остаток минуты — отдых.

- **Пример:** 10 минут EMOM: минута 1 — 5 muscle-ups, минута 2 — 10 dips.
- **Цель:** контроль темпа и плотности.
- **Пульсовая зона:** Z3-Z4.
- **Риск:** недооценка времени → круг не успел.

## Tabata

**20 секунд работа / 10 секунд отдых × 8 раундов** = 4 минуты.

- **Пример:** 4 минуты Tabata: отжимания.
- **Цель:** максимальная плотность, метаболическая тренировка.
- **Пульсовая зона:** Z4-Z5 с пиками в Z5.
- **Риск:** качество падает к 5-6 раунду, нужен контроль формы.

## Interval

Универсальный формат: работа N секунд, отдых M секунд, повтор K раз.

- **Пример:** 40 сек работа / 20 сек отдых × 10 раундов.
- **Цель:** гибкая настройка под цель (сила/выносливость/похудение).
- **Пульсовая зона:** зависит от соотношения.

## PAP — пост-активационное потенцирование

Контрастная тренировка: тяжёлое изометрическое или максимальное усилие, за которым следует взрывное движение.

- **Пример:** 5 секунд удержания горизонта → 3 взрывных подтягивания с подтягом к поясу.
- **Механизм:** миозиновые головки фосфорилируются → следующее сокращение мощнее.
- **Применение:** 1-2 раза в неделю, для продвинутых.

## GTG — Grease the Groove

Метод Павла Цацулина: 5-10 субмаксимальных подходов в день, распределённых во времени, далеко от отказа.

- **Пример:** каждые 2-3 часа по 50% от максимума подтягиваний.
- **Цель:** закрепление навыка, рост без утомления ЦНС.
- **Идеально для:** статических элементов (планш, горизонт), тренировки однорукого.

## Прогрессии в калистенике

Каждое движение имеет «лестницу» прогрессий. Примеры:

### Подтягивания

1. Негативы (только опускание).
2. Австралийские.
3. Подтягивания с эспандером.
4. Классические.
5. Лучника.
6. L-сит.
7. Muscle-up.

### Отжимания

1. От колен.
2. Классические.
3. Алмазные.
4. На одной руке с опорой.
5. На одной руке.
6. Отжимания в стойке на руках.

### Статика: планш

1. Планш tucked (колени к груди).
2. Advanced tucked (бёдра выше).
3. Single-leg / straddle (ноги врозь).
4. Full planche (ноги вместе, прямые).

## Тренировочные концепции

### Split vs Full Body

- **Full Body** — 3 раза в неделю, каждое движение затрагивает тело целиком. Подходит для новичков.
- **Push/Pull/Legs** — 6 раз в неделю, каждое движение по 2 раза. Подходит для продвинутых.
- **Upper/Lower** — 4 раза в неделю.
- **Push/Pull** — 4 раза в неделю.

### Skill vs Strength

- **Skill day** — статика и навыки (планш, горизонт, handstand), GTG-стиль, низкий объём.
- **Strength day** — динамические движения с весом, 3-5 подходов по 3-5 повторений.

### Pyramid

- **Прямая пирамида:** 1-2-3-4-5-6-5-4-3-2-1.
- **Русская пирамида:** 5-4-3-2-1-1-2-3-4-5.
- **Цель:** комбинация объёма и интенсивности.

## Комбинирование форматов

В Calisthenics Power можно комбинировать форматы. Пример недели:

| День | Формат | Цель |
| --- | --- | --- |
| Пн | EMOM (сила) | Push 5×5 |
| Вт | AMRAP (выносливость) | 20 мин круг |
| Ср | Отдых | — |
| Чт | Interval (гипертрофия) | 40/20 × 10 |
| Пт | Skill + GTG | Планш |
| Сб | AMRAP | 30 мин |
| Вс | Отдых | — |

## Резюме

Разнообразие форматов — инструмент для долгосрочного прогресса. Не существует «правильного» формата, есть подходящий для цели и уровня.`,
    contentEn: `## Format classification

Calisthenics uses several dozen formats. Calisthenics Power supports the four core ones:

## AMRAP

**As Many Rounds As Possible** — perform as many rounds of a given scheme as you can within a fixed time.

- **Example:** 20-min AMRAP: 5 pull-ups + 10 push-ups + 15 squats.
- **Goal:** endurance, volume.
- **HR zone:** Z4-Z5.
- **Risk:** high if the scheme is unbalanced. Local shoulder girdle fatigue.

## EMOM

**Every Minute On the Minute** — each minute perform a set number of reps, the rest of the minute is rest.

- **Example:** 10-min EMOM: minute 1 — 5 muscle-ups, minute 2 — 10 dips.
- **Goal:** pace and density control.
- **HR zone:** Z3-Z4.
- **Risk:** underestimating time → round not completed.

## Tabata

**20 seconds work / 10 seconds rest × 8 rounds** = 4 minutes.

- **Example:** 4-min Tabata: push-ups.
- **Goal:** maximal density, metabolic training.
- **HR zone:** Z4-Z5 with peaks in Z5.
- **Risk:** quality drops by rounds 5-6, form control is needed.

## Interval

Universal format: N seconds work, M seconds rest, K rounds.

- **Example:** 40 sec work / 20 sec rest × 10 rounds.
- **Goal:** flexible tuning for the goal (strength/endurance/fat loss).
- **HR zone:** depends on the ratio.

## PAP — post-activation potentiation

Contrast training: heavy isometric or maximal effort followed by an explosive movement.

- **Example:** 5-second lever hold → 3 explosive pull-ups to the waist.
- **Mechanism:** myosin heads phosphorylate → the next contraction is stronger.
- **Application:** 1-2 times per week, for advanced athletes.

## GTG — Grease the Groove

Pavel Tsatsouline's method: 5-10 submaximal sets throughout the day, far from failure.

- **Example:** every 2-3 hours, 50% of max pull-ups.
- **Goal:** skill consolidation, growth without CNS fatigue.
- **Ideal for:** static elements (planche, lever), one-arm training.

## Calisthenics progressions

Every movement has a "ladder" of progressions. Examples:

### Pull-ups

1. Negatives (descent only).
2. Australian.
3. Band-assisted.
4. Classic.
5. Archer.
6. L-sit.
7. Muscle-up.

### Push-ups

1. From knees.
2. Classic.
3. Diamond.
4. One-arm with elevation.
5. One-arm.
6. Handstand push-ups.

### Statics: planche

1. Tucked planche (knees to chest).
2. Advanced tucked (hips higher).
3. Single-leg / straddle.
4. Full planche (legs together, straight).

## Training concepts

### Split vs Full Body

- **Full Body** — 3 times per week, each session works the whole body. For beginners.
- **Push/Pull/Legs** — 6 times per week, each movement twice. For advanced.
- **Upper/Lower** — 4 times per week.
- **Push/Pull** — 4 times per week.

### Skill vs Strength

- **Skill day** — statics and skills (planche, lever, handstand), GTG-style, low volume.
- **Strength day** — weighted dynamic movements, 3-5 sets of 3-5 reps.

### Pyramid

- **Straight pyramid:** 1-2-3-4-5-6-5-4-3-2-1.
- **Russian pyramid:** 5-4-3-2-1-1-2-3-4-5.
- **Goal:** combination of volume and intensity.

## Combining formats

In Calisthenics Power formats can be combined. Example week:

| Day | Format | Goal |
| --- | --- | --- |
| Mon | EMOM (strength) | Push 5×5 |
| Tue | AMRAP (endurance) | 20-min circuit |
| Wed | Rest | — |
| Thu | Interval (hypertrophy) | 40/20 × 10 |
| Fri | Skill + GTG | Planche |
| Sat | AMRAP | 30 min |
| Sun | Rest | — |

## Summary

Format variety is a tool for long-term progress. There is no "right" format — there is the right one for the goal and level.`,
    sources: [
      "Easy Strength (Pavel Tsatsouline)",
      "Building the Gymnastic Body (C. Sommer)",
    ],
  },

  // ====== 8. ТРАВМЫ И ПРОФИЛАКТИКА ======
  {
    slug: "injuries",
    category: "injuries",
    titleRu: "Травмы и профилактика",
    titleEn: "Injuries and prevention",
    order: 8,
    contentRu: `## Специфика травм в калистенике

Калистеника — «суставоёмкий» вид спорта. Большинство движений нагружает **длинные рычаги**, что создаёт высокие моменты на локтях, плечах, запястьях. Самые частые травмы:

- **Локоть:** дистальное сухожилие бицепса, медиальный эпикондилит.
- **Плечо:** ротаторная манжета, импинджмент, SLAP-повреждения.
- **Запястье:** тендинит разгибателей, TFCC.
- **Нижняя часть спины:** мышечные спазмы, грыжи дисков при неправильной технике.

## Топ-6 травм калистеники

### 1. Дистальный тендинит бицепса

- **Причина:** избыток тяжёлых тяг, особенно подтягиваний на одной руке, уголков и горизонтальных тяг без подготовки.
- **Симптомы:** боль в передней части локтя, усиление при сгибании с сопротивлением.
- **Лечение:** 6-12 недель эксцентрической нагрузки (диагональные сгибания с гантелью 3×15), исключение тяг на 4-8 недель.
- **Профилактика:** постепенное увеличение объёма тяг, контрастное напряжение бицепса+трицепса в статике.

### 2. Медиальный эпикондилит («локоть гольфиста»)

- **Причина:** перегрузка флексоров запястья и предплечья (хват).
- **Симптомы:** боль с внутренней стороны локтя.
- **Лечение:** эксцентрические сгибания запястья, миофасциальный релиз.
- **Профилактика:** силовой хват (dead hangs 30-60 сек), ротация хвата.

### 3. Импинджмент-синдром плеча

- **Причина:** недостаточная подвижность грудного отдела + слабость нижней трапеции → субакромиальное сужение.
- **Симптомы:** боль при подъёме руки выше 90°, особенно в handstand.
- **Лечение:** восстановление подвижности грудного отдела, укрепление нижней трапеции и вращательной манжеты.
- **Профилактика:** прямые австралийские тяги, face pulls, мобилизация грудного отдела.

### 4. Тендинит разгибателей запястья

- **Причина:** планши, horizontals — упор на прямые запястья с большим рычагом.
- **Симптомы:** боль на тыльной стороне запястья, усиление при разгибании с сопротивлением.
- **Лечение:** покой, эксцентрические разгибания запястья с лёгким весом.
- **Профилактика:** использование parallettes (нейтральный хват), укрепление разгибателей.

### 5. Мышечный спазм нижней части спины

- **Причина:** неправильная техника в тягах с раскачкой, отсутствие кор-контроля в планше/горизонте.
- **Симптомы:** резкая боль, ограничение движений.
- **Лечение:** покой 3-5 дней, мягкое растяжение, МФР с мячиком.
- **Профилактика:** укрепление кора (мёртвый жук, птица-собака), контроль техники.

### 6. Подвывих плеча

- **Причина:** muscle-up с неправильной техникой, freestyle элементы без подготовки.
- **Симптомы:** острая боль, ощущение «вылета» сустава.
- **Лечение:** немедленно к врачу; реабилитация 3-6 месяцев.
- **Профилактика:** укрепление вращательной манжеты, медленное освоение muscle-up.

## Реабилитация связок

**Сухожилия и связки** адаптируются **медленнее мышц** (3-6 месяцев против 4-8 недель). Это критично: мышца может «расти» быстрее, чем связка способна безопасно нагрузиться.

### Принципы реабилитации:

- **Изометрия** — 5×30 сек удержания при лёгкой боли (3-4/10).
- **Эксцентрики** — 3×15 медленных опусканий с весом.
- **Прогрессивная нагрузка** — +10% объёма в неделю.
- **Контроль боли** — не более 4/10 во время упражнений.

### Фазы реабилитации:

1. **Острая (0-72 ч):** покой, лёд, компрессия, возвышение (RICE).
2. **Подострая (3 дня - 3 недели):** изометрия, лёгкая мобилизация.
3. **Ремоделирования (3+ недели):** эксцентрики, прогрессивная нагрузка.
4. **Возврат к тренировкам (4-12 недель):** специфичная нагрузка, контроль техники.

## Профилактика

### Разминка — обязательна

10-15 минут суставной гимнастики + динамической растяжки перед каждой тренировкой. Особенно запястья, плечи, локти.

### Техника важнее объёма

Каждое повторение должно быть чистым. Если форма ломается — это последнее повторение в подходе.

### Прогрессия шаг за шагом

Не переходи к новой прогрессии, пока не сделаешь 8-10 чистых повторений на текущей.

### Укрепление слабых мест

- **Вращательная манжета:** внешние ротации с эспандером 3×15.
- **Нижняя трапеция:** прямые австралийские тяги 3×12.
- **Разгибатели запястья:** разгибания с лёгким весом 3×15.
- **Кор:** мёртвый жук, птица-собака, plank variations.

### Сон и питание

Без сна 7+ часов и белка 1.6-2.2 г/кг связки не восстанавливаются.

### Управление объёмом

- Не более 2 тяжёлых тяг в неделю.
- Не более 2 статических навыков одновременно.
- Один разгрузочный день в неделю.

## Когда к врачу

- Боль не проходит 7+ дней.
- Боль с иррадиацией в руку/ногу.
- Онемение, покалывание.
- Заметная деформация сустава.
- Невозможность опереться на конечность.

## Calisthenics Power: матрица травм

В приложении есть **матрица травм по 9 зонам** (левый/правый локоть, плечо, запястье + нижняя часть спины, шея, колени). При добавлении травмы приложение автоматически:

- Подсвечивает упражнения, нагружающие зону.
- Предлагает альтернативы с пониженным коэф. нагрузки.
- Логирует восстановление в днях.

## Резюме

Травма в калистенике — почти всегда следствие **несоразмерного объёма** и **недостаточной адаптации связок**. Прогрессия шаг за шагом, разминка и укрепление слабых мест — три кита долголетия в спорте.`,
    contentEn: `## Calisthenics injury profile

Calisthenics is a "joint-heavy" sport. Most movements load **long levers**, creating high moments on elbows, shoulders, wrists. The most common injuries:

- **Elbow:** distal biceps tendon, medial epicondylitis.
- **Shoulder:** rotator cuff, impingement, SLAP lesions.
- **Wrist:** extensor tendonitis, TFCC.
- **Lower back:** muscle spasms, disc herniations under poor technique.

## Top-6 calisthenics injuries

### 1. Distal biceps tendonitis

- **Cause:** excess heavy pulling, especially one-arm pull-ups, L-sits and horizontal pulls without preparation.
- **Symptoms:** anterior elbow pain, worse with resisted flexion.
- **Treatment:** 6-12 weeks of eccentric loading (diagonal curls with a dumbbell 3×15), exclude pulls for 4-8 weeks.
- **Prevention:** gradual pull-up volume, biceps+triceps co-contraction in statics.

### 2. Medial epicondylitis ("golfer's elbow")

- **Cause:** overload of wrist flexors and forearm (grip).
- **Symptoms:** pain on the inner elbow.
- **Treatment:** eccentric wrist curls, myofascial release.
- **Prevention:** dead hangs 30-60 sec, grip rotation.

### 3. Shoulder impingement syndrome

- **Cause:** poor thoracic mobility + weak lower trapezius → subacromial narrowing.
- **Symptoms:** pain raising the arm above 90°, especially in handstand.
- **Treatment:** restore thoracic mobility, strengthen lower trap and rotator cuff.
- **Prevention:** straight Australian pulls, face pulls, thoracic mobilisation.

### 4. Wrist extensor tendonitis

- **Cause:** planches, levers — pressure on straight wrists with a long lever.
- **Symptoms:** pain on the back of the wrist, worse with resisted extension.
- **Treatment:** rest, eccentric wrist extensions with light weight.
- **Prevention:** parallettes (neutral grip), extensor strengthening.

### 5. Lower back muscle spasm

- **Cause:** poor technique in kipping pull-ups, lack of core control in planche/lever.
- **Symptoms:** sharp pain, limited movement.
- **Treatment:** 3-5 days rest, soft stretching, ball MFR.
- **Prevention:** core strengthening (dead bug, bird dog), technique control.

### 6. Shoulder subluxation

- **Cause:** muscle-up with poor technique, freestyle elements without preparation.
- **Symptoms:** sharp pain, sensation of joint "popping out".
- **Treatment:** see a doctor immediately; 3-6 months rehab.
- **Prevention:** rotator cuff strengthening, slow muscle-up progression.

## Tendon rehabilitation

**Tendons and ligaments** adapt **slower than muscles** (3-6 months vs 4-8 weeks). This is critical: a muscle can "grow" faster than the tendon can safely bear load.

### Rehab principles:

- **Isometrics** — 5×30 sec holds at mild pain (3-4/10).
- **Eccentrics** — 3×15 slow descents with weight.
- **Progressive loading** — +10% volume per week.
- **Pain control** — no more than 4/10 during exercises.

### Rehab phases:

1. **Acute (0-72 h):** rest, ice, compression, elevation (RICE).
2. **Subacute (3 days - 3 weeks):** isometrics, light mobilisation.
3. **Remodelling (3+ weeks):** eccentrics, progressive loading.
4. **Return to training (4-12 weeks):** specific loading, technique control.

## Prevention

### Warm-up is mandatory

10-15 minutes of joint mobility + dynamic stretching before every session. Especially wrists, shoulders, elbows.

### Technique over volume

Every rep must be clean. If form breaks, that was the last rep of the set.

### Step-by-step progression

Do not move to the next progression until you do 8-10 clean reps at the current one.

### Strengthening weak points

- **Rotator cuff:** external rotations with a band 3×15.
- **Lower trapezius:** straight Australian pulls 3×12.
- **Wrist extensors:** light-weight extensions 3×15.
- **Core:** dead bug, bird dog, plank variations.

### Sleep and nutrition

Without 7+ hours sleep and 1.6-2.2 g/kg protein, tendons will not recover.

### Volume management

- No more than 2 heavy pulls per week.
- No more than 2 static skills at the same time.
- One deload day per week.

## When to see a doctor

- Pain persists 7+ days.
- Pain radiating to arm/leg.
- Numbness, tingling.
- Visible joint deformity.
- Inability to bear weight on the limb.

## Calisthenics Power: injury matrix

The app has an **injury matrix across 9 zones** (left/right elbow, shoulder, wrist + lower back, neck, knees). When you add an injury the app automatically:

- Highlights exercises loading that zone.
- Suggests alternatives with a lower load coefficient.
- Logs recovery in days.

## Summary

Injury in calisthenics is almost always a result of **disproportionate volume** and **insufficient tendon adaptation**. Step-by-step progression, warm-up and strengthening weak points are the three pillars of athletic longevity.`,
    sources: [
      "Rehabilitation of the Injured Athlete (Andrews)",
      "Overcoming Gravity (S. Low) — injury section",
    ],
  },

  // ====== 9. ПСИХОЛОГИЯ ======
  {
    slug: "psychology",
    category: "psychology",
    titleRu: "Психология тренировок",
    titleEn: "Psychology of training",
    order: 9,
    contentRu: `## Тренировка начинается в голове

**Мышцы растут от тренировки, но решение тренироваться принимает мозг.** Без понимания психологии прогресса ни одна программа не сработает.

## Дисциплина vs Мотивация

- **Мотивация** — эмоциональное состояние. Приходит и уходит. Нельзя полагаться.
- **Дисциплина** — навык выполнять действие независимо от настроения. Растёт через привычку.

Исследования показывают, что мотивация работает 2-4 недели после старта. Дальше нужен навык. Calisthenics Power построен так, чтобы **превратить тренировку в рутину**, а не в зависимость от вдохновения.

## Целеполагание по SMART

- **S**pecific — конкретно: «подтянуться 20 раз», а не «стать сильнее».
- **M**easurable — измеримо: число повторений, удержание сек.
- **A**chievable — достижимо: реалистично за 2-3 месяца.
- **R**elevant — значимо: важно для вас, а не для других.
- **T**ime-bound — в срок: с датой окончания.

## Процессные vs Результатные цели

- **Результатная:** «Сделать мышл-ап за 3 месяца». Жёсткая, может фрустрировать.
- **Процессная:** «Тренироваться 3 раза в неделю без пропусков». Управляемая.

Идеально: **80% процессных целей, 20% результатных**. Процесс под контролем, результат — нет.

## Дофаминовая петля

Дофамин — нейромедиатор ожидания награды. Большая цель «далеко» даёт слабый выброс. Маленькие ежедневные достижения — сильные.

Поэтому в Calisthenics Power:

- Логирование тренировки → мгновенный feedback.
- Прогресс по повторениям визуализирован.
- HRV, сон, настроение — трекаются как индикаторы.

Каждое такое касание — микродоза дофамина, которая закрепляет привычку.

## Сопротивление и прокрастинация

**Прокрастинация** — не лень, а избегание дискомфорта. Мозг выбирает меньшее сопротивление (пролистать ленту) вместо большего (тренировка).

### Анти-стратегии:

- **Правило 2 минут:** «Начну на 2 минуты». Через 2 минуты мозг уже в действии и продолжит.
- **Реализация намерений (if-then):** «Если 19:00 — то я надеваю форму и иду на турник».
- **Снижение трения:** форма с вечера, турник на виду, расписание в календаре.
- **Правило 1 дня:** сегодня тренируюсь. Завтра — решу завтра. Это снимает давление «вечно».

## Внутренняя vs Внешняя мотивация

- **Внешняя:** кубки, признание, «чтобы нравиться». Быстро тает.
- **Внутренняя:** радость от движения, ощущение прогресса, мастерство. Стабильна.

Исследования (Deci & Ryan, Self-Determination Theory): внутренняя мотивация растёт, когда удовлетворены 3 базовые потребности:

- **Автономия** — выбор цели и метода.
- **Компетентность** — ощущение роста мастерства.
- **Связанность** — принадлежность к сообществу.

## Холизм: тело-разум-среда

Тренировка — не изолированное событие. Влияет всё:

- **Сон** — 7-9 часов. Недосып = повышенный кортизол = низкий тестостерон.
- **Питание** — дефицит белка = снижение синтеза мышц.
- **Стресс** — постоянная тревога = перетренированность даже при умеренной нагрузке.
- **Социальная среда** — тренировки с группой повышают adherence на 30%.

## Срывы и как из них выходить

Срыв (пропуск недели, травма, болезнь) — норма. Не норма — превращать срыв в отказ.

### Принципы восстановления:

- **Не откатывайся в нуль.** Если пропустил 2 недели, начни с 60% объёма, не с 100%.
- **Прими срыв как данные.** Почему произошёл? Что изменить?
- **Не наказывай себя.** Чувство вины снижает мотивацию.
- **Перезапусти с маленькой цели.** Одна тренировка в неделю лучше, чем «в понедельник начну заново».

## Страх перед прогрессиями

Новые элементы (планш, однорукое, muscle-up) часто сопровождаются **страхом неудачи или травмы**. Этот страх — нормальный эволюционный ответ.

### Анти-стратегии:

- **Декомпозиция** — разбей на микро-шаги (tucked → advanced tucked → straddle).
- **Страховка** — маты, эспандеры, партнёр.
- **Визуализация** — мысленно прокрути движение перед выполнением.
- **Лёгкие попытки** — сначала негативные повторения, потом полный элемент.

## Выгорание

Симптомы:

- Снижение мотивации на 4+ недели.
- Тренировка воспринимается как обязанность.
- Падение результатов без явной причины.
- Раздражительность, апатия.

Лечение:

- 1-2 недели полного отдыха или лёгкой активности (ходьба, плавание).
- Смена фокуса: с силы на мобильность, со статика на динамику.
- Пересмотр целей: возможно, цели чужие, а не твои.

## Резюме

Психология — не «soft skills», а фундамент долгосрочного прогресса. Без управления мотивацией, дисциплиной и восстановлением даже лучшая программа тренировок провалится через 2-3 месяца.`,
    contentEn: `## Training starts in the head

**Muscles grow from training, but the decision to train is made by the brain.** Without understanding the psychology of progress, no program will work.

## Discipline vs Motivation

- **Motivation** — an emotional state. Comes and goes. Cannot be relied upon.
- **Discipline** — the skill of acting regardless of mood. Grows through habit.

Research shows motivation lasts 2-4 weeks after starting. After that you need skill. Calisthenics Power is built to **turn training into a routine**, not into a dependence on inspiration.

## SMART goal-setting

- **S**pecific — concrete: "20 pull-ups", not "get stronger".
- **M**easurable — countable: reps, seconds held.
- **A**chievable — realistic in 2-3 months.
- **R**elevant — important to you, not others.
- **T**ime-bound — with a deadline.

## Process vs Outcome goals

- **Outcome goal:** "Muscle-up in 3 months". Hard, can frustrate.
- **Process goal:** "Train 3 times per week without skipping". Controllable.

Ideal: **80% process goals, 20% outcome goals**. The process is under your control, the outcome is not.

## Dopamine loop

Dopamine is the neurotransmitter of reward anticipation. A big "far" goal gives a weak release. Small daily achievements give strong ones.

That is why Calisthenics Power:

- Logs every training → instant feedback.
- Visualises rep progress.
- Tracks HRV, sleep, mood as indicators.

Each such touch is a micro-dose of dopamine that consolidates the habit.

## Resistance and procrastination

**Procrastination** is not laziness but avoidance of discomfort. The brain picks the lower resistance (scrolling) over the higher (training).

### Anti-strategies:

- **2-minute rule:** "I'll start for 2 minutes". After 2 minutes the brain is in action and continues.
- **Implementation intentions (if-then):** "If 19:00 — I put on the gear and go to the bar".
- **Reduce friction:** gear ready the night before, bar in sight, schedule in calendar.
- **One-day rule:** I train today. Tomorrow — decide tomorrow. This removes the pressure of "forever".

## Intrinsic vs Extrinsic motivation

- **Extrinsic:** trophies, recognition, "to be liked". Fades fast.
- **Intrinsic:** joy of movement, sense of progress, mastery. Stable.

Research (Deci & Ryan, Self-Determination Theory): intrinsic motivation grows when three basic needs are met:

- **Autonomy** — choosing the goal and the method.
- **Competence** — feeling of growing mastery.
- **Relatedness** — belonging to a community.

## Holism: body-mind-environment

Training is not an isolated event. Everything affects it:

- **Sleep** — 7-9 hours. Deficit = higher cortisol = lower testosterone.
- **Nutrition** — protein deficit = reduced muscle synthesis.
- **Stress** — chronic anxiety = overtraining even at moderate load.
- **Social environment** — group training increases adherence by 30%.

## Setbacks and how to recover

A setback (missing a week, injury, illness) is normal. Not normal is turning a setback into giving up.

### Recovery principles:

- **Don't roll back to zero.** If you missed 2 weeks, start at 60% volume, not 100%.
- **Treat the setback as data.** Why did it happen? What to change?
- **Don't punish yourself.** Guilt reduces motivation.
- **Restart with a small goal.** One training per week is better than "Monday I'll start again".

## Fear of progressions

New elements (planche, one-arm, muscle-up) often come with **fear of failure or injury**. This fear is a normal evolutionary response.

### Anti-strategies:

- **Decomposition** — break into micro-steps (tucked → advanced tucked → straddle).
- **Spotting** — mats, bands, partner.
- **Visualisation** — mentally rehearse the movement before performing.
- **Light attempts** — negatives first, then the full element.

## Burnout

Symptoms:

- Motivation down for 4+ weeks.
- Training feels like an obligation.
- Performance drop without obvious cause.
- Irritability, apathy.

Treatment:

- 1-2 weeks of complete rest or light activity (walking, swimming).
- Shift focus: from strength to mobility, from static to dynamic.
- Review goals: maybe they are not yours.

## Summary

Psychology is not "soft skills" but the foundation of long-term progress. Without managing motivation, discipline and recovery, even the best training program will fail in 2-3 months.`,
    sources: [
      "Self-Determination Theory (Deci & Ryan)",
      "Atomic Habits (J. Clear)",
      "The Power of Habit (C. Duhigg)",
    ],
  },

  // ====== 10. ИСТОЧНИКИ ======
  {
    slug: "sources",
    category: "sources",
    titleRu: "Источники и литература",
    titleEn: "Sources and literature",
    order: 10,
    contentRu: `## Как мы отбирали источники

В Calisthenics Power мы опираемся на **проверенную научную литературу** и практический опыт признанных специалистов. Все рекомендации в приложении сверяются с базовыми принципами биомеханики, кинезиологии и физиологии.

## Книги по калистенике и воркауту

### Уровень: фундамент

- **Overcoming Gravity** — *Steven Low*. Энциклопедия калистеники: прогрессии, биомеханика, программа тренировок, травмы.
- **Building the Gymnastic Body** — *Christopher Sommer*. Классика гимнастической подготовки, основа для статических прогрессий.
- **Street Workout: Manual of the WSWCF** — официальное руководство Всемирной ассоциации воркаута.

### Уровень: методология

- **Power to the People!** — *Pavel Tsatsouline*. Минимализм в силовой тренировке, метод GTG.
- **Easy Strength** — *Pavel Tsatsouline, Dan John*. Принципы низкообъёмной силовой работы.
- **Never Let Go** — *Dan John*. Философия тренировок и циклирование.

### Уровень: биомеханика и кинезиология

- **Biomechanics of Movement** — *Joseph Hamill, Timothy Knutzen*. Базовый учебник по биомеханике.
- **Kinesiology of the Musculoskeletal System** — *Donald Neumann*. Анатомия и функции мышц.
- **Strength Training Anatomy** — *Frederic Delavier*. Иллюстрированная анатомия упражнений.

### Уровень: физиология

- **Physiology of Sport and Exercise** — *Wilmore, Costill, Kenney*. Базовый учебник по физиологии спорта.
- **Supertraining** — *Yuri Verkhoshansky, Mel Siff*. Продвинутая теория тренировок, адаптация.
- **Science and Practice of Strength Training** — *Vladimir Zatsiorsky, William Kraemer*. Наука максимальной силы.

### Уровень: питание и добавки

- **The Renaissance Diet 2.0** — *Mike Israetel et al.* Научно обоснованное питание для спортсменов.
- **Scientific Principles of Hypertrophy Training** — *Mike Israetel*. Гипертрофия от науки.
- ISSN Position Stands — позиционные документы Международного общества спортивного питания (креатин, протеин, кофеин, бета-аланин).

### Уровень: травмы и реабилитация

- **Rehabilitation of the Injured Athlete** — *Andrews, Harrelson, Aaron*. Реабилитация спортивных травм.
- **Diagnosis and Treatment of Movement Impairment Syndromes** — *Shirley Sahrmann*. Диагностика двигательных нарушений.

## Психология и привычки

- **Atomic Habits** — *James Clear*. Формирование привычек.
- **The Power of Habit** — *Charles Duhigg*. Контекст нейронаук привычки.
- **Drive** — *Daniel Pink*. Внутренняя мотивация.

## Научные журналы

- **Journal of Strength and Conditioning Research** (NSCA).
- **Medicine & Science in Sports & Exercise** (ACSM).
- **Sports Medicine** (Springer).
- **European Journal of Applied Physiology**.
- **British Journal of Sports Medicine**.

## Ключевые исследования

### Эксцентрическая тренировка

- **Hortobágyi et al., 1996** — эксцентрическое сокращение производит больше силы, чем концентрическое при той же EMG-активности.

### PAP — пост-активационное потенцирование

- **Tillin & Bishop, 2009** — обзор механизмов PAP и факторов, влияющих на его выраженность.
- **Hodgson et al., 2005** — усталость vs потенцирование: баланс.

### Внешний фокус внимания

- **Wulf, 2007** — constrained action hypothesis, обзор эффектов внешнего фокуса.

### HRV и восстановление

- **Plews et al., 2013** — использование HRV в тренировке выносливости.

### Креатин

- **Kreider et al., 2017** — ISSN position stand по креатину.

### Гипертрофия и нагрузка

- **Schoenfeld et al., 2017** — сила vs гипертрофия при разных диапазонах повторений.
- **Brad Schoenfeld — Science and Development of Muscle Hypertrophy**.

## Онлайн-ресурсы

- **ExRx.net** — каталог упражнений и мышечной анатомии.
- **Reddit r/bodyweightfitness** — сообщество и FAQ по калистенике.
- **GMB Fitness** — программы мобильности и навыка.
- **Calisthenicmovement (Calisthenicmovement.com)** — обучающие видео.

## Принципы критического чтения

Не любая научная публикация равна. Обращайте внимание на:

- **Размер выборки** — n < 20 = предварительные данные.
- **Уровень доказательности** — мета-анализ > РКИ > наблюдательное > case report.
- **Специфичность выборки** — выводы на новичках ≠ выводы на продвинутых.
- **Длительность** — 4-недельное исследование ≠ долгосрочный эффект.
- **Конфликт интересов** — финансирование производителем добавок должно быть отмечено.

## Calisthenics Power и источники

В каждой карточке упражнения, техники и в теоретическом разделе указаны конкретные источники. Если источник не указан — это значит, что материал основан на консолидированном знании из нескольких перечисленных книг и обзорах.

Мы намеренно избегаем «гуру-методов», не подкреплённых ни научной литературой, ни длительной практикой. Приоритет — проверяемые, воспроизводимые методы.

## Призыв к действию

Это приложение — инструмент, а не учитель. Если тебе интересна научная база — открой первоисточники. Если практика — иди на турник. Оптимальный путь: теория и практика в обратной связи друг с другом.

## Резюме

Источники — это не «список литературы», а **сетка координат**, которая отличает работающую методику от маркетинга.`,
    contentEn: `## How we selected sources

In Calisthenics Power we rely on **verified scientific literature** and the practical experience of recognised specialists. All recommendations in the app are checked against the foundational principles of biomechanics, kinesiology and physiology.

## Books on calisthenics and street workout

### Level: foundation

- **Overcoming Gravity** — *Steven Low*. An encyclopaedia of calisthenics: progressions, biomechanics, programming, injuries.
- **Building the Gymnastic Body** — *Christopher Sommer*. A classic of gymnastic conditioning, the basis for static progressions.
- **Street Workout: Manual of the WSWCF** — official manual of the World Street Workout and Calisthenics Federation.

### Level: methodology

- **Power to the People!** — *Pavel Tsatsouline*. Minimalism in strength training, the GTG method.
- **Easy Strength** — *Pavel Tsatsouline, Dan John*. Principles of low-volume strength work.
- **Never Let Go** — *Dan John*. Philosophy of training and cycling.

### Level: biomechanics and kinesiology

- **Biomechanics of Movement** — *Joseph Hamill, Timothy Knutzen*. Foundational biomechanics textbook.
- **Kinesiology of the Musculoskeletal System** — *Donald Neumann*. Anatomy and function of muscles.
- **Strength Training Anatomy** — *Frederic Delavier*. Illustrated anatomy of exercises.

### Level: physiology

- **Physiology of Sport and Exercise** — *Wilmore, Costill, Kenney*. Foundational exercise physiology textbook.
- **Supertraining** — *Yuri Verkhoshansky, Mel Siff*. Advanced training theory, adaptation.
- **Science and Practice of Strength Training** — *Vladimir Zatsiorsky, William Kraemer*. Science of maximal strength.

### Level: nutrition and supplements

- **The Renaissance Diet 2.0** — *Mike Israetel et al.* Evidence-based nutrition for athletes.
- **Scientific Principles of Hypertrophy Training** — *Mike Israetel*. Hypertrophy from science.
- ISSN Position Stands — position papers of the International Society of Sports Nutrition (creatine, protein, caffeine, beta-alanine).

### Level: injuries and rehab

- **Rehabilitation of the Injured Athlete** — *Andrews, Harrelson, Aaron*. Rehabilitation of sports injuries.
- **Diagnosis and Treatment of Movement Impairment Syndromes** — *Shirley Sahrmann*. Diagnosis of movement impairments.

## Psychology and habits

- **Atomic Habits** — *James Clear*. Building habits.
- **The Power of Habit** — *Charles Duhigg*. The neuroscience of habit.
- **Drive** — *Daniel Pink*. Intrinsic motivation.

## Scientific journals

- **Journal of Strength and Conditioning Research** (NSCA).
- **Medicine & Science in Sports & Exercise** (ACSM).
- **Sports Medicine** (Springer).
- **European Journal of Applied Physiology**.
- **British Journal of Sports Medicine**.

## Key studies

### Eccentric training

- **Hortobágyi et al., 1996** — eccentric contraction produces more force than concentric at the same EMG activity.

### PAP — post-activation potentiation

- **Tillin & Bishop, 2009** — review of PAP mechanisms and modulating factors.
- **Hodgson et al., 2005** — fatigue vs potentiation: the balance.

### External focus of attention

- **Wulf, 2007** — constrained action hypothesis, review of external focus effects.

### HRV and recovery

- **Plews et al., 2013** — use of HRV in endurance training.

### Creatine

- **Kreider et al., 2017** — ISSN position stand on creatine.

### Hypertrophy and load

- **Schoenfeld et al., 2017** — strength vs hypertrophy across rep ranges.
- **Brad Schoenfeld — Science and Development of Muscle Hypertrophy**.

## Online resources

- **ExRx.net** — exercise and muscle anatomy catalogue.
- **Reddit r/bodyweightfitness** — community and FAQ on calisthenics.
- **GMB Fitness** — mobility and skill programs.
- **Calisthenicmovement (Calisthenicmovement.com)** — instructional videos.

## Principles of critical reading

Not every scientific publication is equal. Pay attention to:

- **Sample size** — n < 20 = preliminary data.
- **Level of evidence** — meta-analysis > RCT > observational > case report.
- **Sample specificity** — findings on novices ≠ findings on advanced athletes.
- **Duration** — a 4-week study ≠ long-term effect.
- **Conflict of interest** — manufacturer funding of supplements should be disclosed.

## Calisthenics Power and sources

Each exercise, technique and theory card lists specific sources. If no source is given, the material is based on consolidated knowledge from several of the listed books and reviews.

We intentionally avoid "guru methods" unsupported by either scientific literature or long-term practice. The priority is verifiable, reproducible methods.

## Call to action

This app is a tool, not a teacher. If you are interested in the science — go to the primary sources. If in practice — go to the bar. The optimal path: theory and practice in feedback with each other.

## Summary

Sources are not a "reading list" but a **coordinate grid** that distinguishes a working methodology from marketing.`,
    sources: [
      "Overcoming Gravity (S. Low)",
      "Supertraining (Y. Verkhoshansky, M. Siff)",
      "Physiology of Sport and Exercise (Wilmore, Costill)",
      "Scientific Principles of Hypertrophy Training (M. Israetel)",
      "ISSN Position Stands",
    ],
  },
];
