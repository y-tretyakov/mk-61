# Changelog

All notable changes to the MK-61 Emulator project.

---

## [Unreleased]

### Added

#### Фаза 1: Точность opcodes и запись программ

- **Opcode table**: Добавлена `OPCODE_TABLE` с правильными кодами МК-61 (00-1E). Каждая клавиша маппится на реальный байт-код.
  - `src/store/calculatorStore.ts:45-76`

- **recordProgramStep**: Переписана генерация opcodes:
  - F-модификатор → записывает 2 байта: `1D` (префикс F) + код клавиши
  - K-модификатор → записывает 2 байта: `1E` (префикс K) + код клавиши
  - Без модификатора → 1 байт (код клавиши)
  - `src/store/calculatorStore.ts:78-92`

- **Двухбайтовые инструкции**: Поддержка multi-byte команд в PRG-режиме:
  - `П` / `ИП` → запись opcode + ожидание 1 цифры (номер регистра)
  - `БП` / `ПП` → запись opcode + ожидание 2 цифр (адрес)
  - Не-цифра во время ожидания отменяет режим операнда
  - `src/store/calculatorStore.ts:264-283`

- **ШГ навигация**: `STEP_FWD`/`STEP_BACK` в PRG-режиме (шаг по программе без записи) и в AVT-режиме.
  - `src/store/calculatorStore.ts:458-466`, `src/store/calculatorStore.ts:481-482`

#### Фаза 2: Выполнение программ

- **executeOneStep**: Интерпретатор одного байта программы. Поддерживает:
  - Цифры 00-09 (ввод числа с pushStack для первой цифры)
  - 0A (DOT), 0B (CHS), 0D (CX), 0E (ENTER)
  - 10-11 (П/ИП + 1 байт регистр)
  - 12-13 (БП/ПП + 2 байта адрес из BCD)
  - 14 (С/П — останов или возврат из подпрограммы)
  - 15 (В/О — сброс PC)
  - 16 (SWAP), 17 (+), 18 (−), 19 (×), 1A (÷)
  - 1B (STEP_FWD), 1C (STEP_BACK)
  - 1D-1E (F/K префикс + вызов executeFFunction/executeKFunction)
  - Сохранение X1 перед операциями
  - `src/store/calculatorStore.ts:161-318`

- **executeProgram**: Цикл выполнения программ:
  - Асинхронный через `setTimeout(1ms)` для визуализации
  - Лимит 10 000 шагов (защита от бесконечных циклов)
  - Останов при ошибке (ЕГГОГ) или С/П
  - `src/store/calculatorStore.ts:321-349`

- **С/П обработка**: 
  - В AVT-режиме запускает выполнение программы
  - Блокировка клавиш во время выполнения (только С/П — стоп)
  - `src/store/calculatorStore.ts:425-430`, `src/store/calculatorStore.ts:484-487`

#### Фаза 2.5: Условные переходы

- **OPCODE_TO_KEY**: Добавлены маппинги `14→SP`, `15→VO`, `10→P`, `11→IP`, `12→BP`, `13→PP`, `1B→STEP_FWD`, `1C→STEP_BACK`.
  - `src/store/calculatorStore.ts:150-157`

- **PRG-запись условных переходов**: `F+ШГ/ВО/СП` → запись 1D+key, затем ожидание 2 байт BCD-адреса (`expectingOperand='address'`, `operandDigits=2`).
  - `src/store/calculatorStore.ts:474-479`

- **executeOneStep: условные переходы**: Обработка x<0 (F+ШГ←), x=0 (F+ШГ→), x≥0 (F+ВО), x≠0 (F+С/П) с чтением 2 байт BCD-адреса из `peek(2)`/`peek(3)`.
  - `src/store/calculatorStore.ts:307-324`

#### Фаза 2.6: Пошаговый режим

- **STEP_FWD в AVT**: Выполняет одну инструкцию через `executeOneStep` вместо простого перехода PC.
  - `src/store/calculatorStore.ts:540-547`

#### Фаза 3: Загрузка/сохранение программ

- **exportProgram**: Сериализация programRAM в hex-текст с мнемониками.
  - `src/store/calculatorStore.ts:755-767`

- **importProgram**: Парсинг hex-кодов (разделители: пробелы, запятые, точки с запятой) в programRAM.
  - `src/store/calculatorStore.ts:769-781`

- **EXAMPLE_PROGRAMS**: 3 встроенных примера: 5+3×4, x≥0 тест, факториал 5! с циклом и условным переходом.
  - `src/store/calculatorStore.ts:558-587`

- **localStorage persistence**: Автосохранение (`saveToDisk`) при каждом изменении стора через `subscribe`, загрузка (`loadFromDisk`) при инициализации.
  - `src/store/calculatorStore.ts:527-555`

- **UI экспорта/импорта**: Кнопки Экспорт/Импорт на вкладке «ОЗУ Программы», textarea для hex-кодов, кнопки загрузки примеров.
  - `src/components/SidePanel.tsx`

### Fixed

- **Утечка modifier в PRG-режиме**: Modifier больше не залипает после записи шага. Явно очищается в `next.modifier = null`.
  - `src/store/calculatorStore.ts:239`

- **formatVFD в PRG-режиме**: Показывает реальный код следующего шага вместо хардкода `00`.
  - `src/utils/math.ts:22-26`

- **resetCalculator**: Добавлен сброс новых полей состояния (`expectingOperand`, `operandDigits`, `isProgramRunning`, `returnAddr`).

- **Условные переходы: баг peek()**: `peek(1)`/`peek(2)` исправлены на `peek(2)`/`peek(3)` для чтения адресных байт после F+condition.
  - `src/store/calculatorStore.ts:317-318`

- **E2E селекторы**: Добавлены `id="btn-next-lesson"` и `id="btn-prev-lesson"` в SidePanel.
  - `src/components/SidePanel.tsx`

- **Lesson check: отсутствовал mode**: `check()` в SidePanel не передавал `mode`, из-за чего урок 4 всегда показывал «Ожидает выполнения».
  - `src/components/SidePanel.tsx`

- **Playwright config**: Исправлен `baseURL` на `http://localhost:5173/mk-61/` (GitHub Pages base path).
  - `playwright.config.cjs`

### Changed

- **types.ts**: Добавлены поля `expectingOperand`, `operandDigits`, `returnAddr`. Добавлены методы `exportProgram`, `importProgram`, `loadExample` в `CalculatorActions`.

- **initialState.ts**: Инициализация новых полей.

- **Тесты переименованы**: `.spec.js` → `.spec.cjs` (из-за `"type": "module"` в package.json).
  - `tests/*.spec.cjs`

- **Playwright config**: Переименован `playwright.config.js` → `playwright.config.cjs`.

---

## [2.0.0] — Original Release

Базовая версия эмулятора МК-61 с:
- Интерфейс калькулятора с клавиатурой
- Базовые арифметические операции
- F и K функции
- Регистры стека X, Y, Z, T, X1
- 15 регистров памяти (0-E)
- Режим PRG (запись программ) — с некорректными opcodes
- Режим AVT (вычисления)
- Интерактивный курс из 12 уроков
- Демо-режим для уроков
