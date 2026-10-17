# 🧠 Kamin Blocking

This psychological task investigates the [Kamin blocking phenomenon](https://en.wikipedia.org/wiki/Blocking_effect), where people learn that (1) cue A predicts an outcome, then that (2) cue A and cue B predicts an outcome. When asked if B alone predicts the outcome, they show a diminished response. A is a already a good predictor of the outcome; the intuition is: 'no need to learn from B, given that A already predicts the outcome.' In short, A blocks B. 

In the **social version**, participants are presented with co-workers (represented as emojis) and need to predict whether they will help or sabotage their efforts. In the **non-social version**, subjects associate foods with allergic reactions.

## 🚀 Getting Started

### Clone the Repository
To clone the `fmri` branch with all necessary submodules into a `kaminBlocking-fmri` folder, run:
```bash
git clone --recurse-submodules -j4 --branch fmri git@github.com:belieflab/kaminBlocking.git kaminBlocking-fmri && cd kaminBlocking-fmri &&
git submodule foreach --recursive 'git checkout $(git config -f $toplevel/.gitmodules submodule.$name.branch || echo main)'
```

> 💡 This will initialize the `wrap` submodule

### Stay Updated

When pulling changes, run:

```bash
./sync.sh
```

> 🔄 This ensures the `wrap` submodule is up-to-date

### ⚙️ Configuration

Modify `exp/conf.js` to customize your experiment. Key options include:

```javascript
// Debug Mode
const debug = true;

// Experiment Version
const version = "deck"; // Options: "deck", "avatar", "sabotage", "gain", "loss"

// URL Configuration
const urlConfig = {
    default: "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_bErtyAFIwnwDhWu",
    loss: "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_8qsU4yfds5mH6Pc",
    gain: "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_8qsU4yfds5mH6Pc",
};

// Intake Variables (for in-person experiments)
const intake = {
    subject: {
        minLength: 7,
        maxLength: 7,
        prefix: "VIP"
    },
    nih: false, // change to true for studies which require bi-annual uploads to the NDA
    sites: ["Vanderbilt"],
    phenotypes: ["hc", "sz"],
    visits: [1,2],
    weeks: [],
};
```

### 🌐 Online Administration

For platforms like PROLIFIC, CloudResearch, MTurk, or Connect, use:

```
https://web-url-of-your-website.com/study-name/prl
```

### Version Information
- **Version**: the 'corrected' version was created after an error was discovered in `testing_stimuli`. The "consistent-allergy" condition had a stimulus 2 pairing, which should never have been the case. Per Phil Corlett, previous data is not compromised for key trial types. However, low-level controls (I-, J+) should not be used in combined analysis of tasks without ensuring the version variable is equal to 'correct'!

## 🎯 Task Description
In every trial participants are shown with cues (represented with letters) and asked to predict an outcome (e.g., allergy). The meals comprise one or two different foods for the non-social version or emojis representing co-workers for the social version. They then have 1 second to determine if an allergy occurred or if they believe a co-worker will help or sabotage them.

## 📊 Alternate Versions and Designs

1. **Standard**
   - **Trials**: 154 total (+3 practice trials)
   - **Cues**: 12 cues including "A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E", "F", "I", "J"
   - Participants imagine they are allergists observing a new patient who has allergic reactions after certain meals.
   - They predict whether the meals will cause allergic reactions based on previous observations of patient reactions.
   - **Trial Structure**:
     - **Learning Phase**: 7 trial types each presented 10 times (1:10) / A1+, A2+, C1-, C2-, F-, I+, J-
     - **Blocking Phase**: 7 trial types each presented 6 times (11:16) / A1B1+, A2B2+, C1D1+, C2D2+, EF-, I+, J-
     - **Testing Phase**: 7 trial types each presented 6 times (17:22) / B1+, B2-, D1+, D2-, EF-, I+, J-
   
| Learning Phase | Blocking Phase | Testing Phase |
|----------------|----------------|---------------|
| A1+            | A1B1+          | B1+           |
| A2+            | A2B2+          | B2-           |
| C1-            | C1D1+          | D1+           |
| C2-            | C2D2+          | D2-           |
| F-             | EF-            | EF-           |
| I+             | I+             | I+            |
| J-             | J-             | J-            |

2. **Short**
   - **Trials**: 112 total (+3 practice trials)
   - **Cues**: 14 cues including "A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E", "F", "I", "J", "K", "L"
   - Participants imagine starting a new job, where they are evaluated by a boss and rely on co-workers, who may help or sabotage them.
   - They predict whether the co-workers will help or sabotage them after observing their actions during the experiment.
   - **Trial Structure**:
     - **Learning Phase**: 4 trial types each presented 10 times (1:10) / A1+, A2+, C1-, C2-
     - **Blocking Phase**: 7 trial types each presented 6 times (11:16) / A1B1+, A2B2+, C1D1+, C2D2+, EF-, IK-, JL-
     - **Testing Phase**: 5 trial types each presented 6 times (17:22) / B1+, B2-, D1+, D2-, L-

| Learning Phase | Blocking Phase | Testing Phase |
|----------------|----------------|---------------|
| A1+            | A1B1+          | B1+           |
| A2+            | A2B2+          | B2-           |
| C1-            | C1D1+          | D1+           |
| C2-            | C2D2+          | D2-           |
| L-             | EF-            | L-            |
|                | IK-            |               |
|                | JL-            |               |

## ⏱ Trial Timing: Original vs fMRI-Friendly

Each trial has a **cue** screen, where the participant predicts the outcome, followed by an **outcome feedback** screen. The original (behavioral) version presents feedback right after the cue with a short 1 s inter-trial interval. The fMRI-friendly version (this branch) adds a jittered **inter-stimulus interval (ISI)** between cue and feedback and uses a longer, jittered **inter-trial interval (ITI)**. This lets the cue-related (prediction) and feedback-related (outcome / prediction error) BOLD responses be modeled separately.

> ℹ️ "Original" and "fMRI-friendly" refer to the **timing** only. Both work with the **Standard** and **Short** stimulus sets described above.

### Trial Events

| Event | What is on screen | Original (behavioral) | fMRI-friendly |
|-------|-------------------|-----------------------|---------------|
| Fixation (pre-cue) | Central `+` | 1 s (de facto ITI) | — (removed; replaced by the ITI below) |
| **Cue** | 1 or 2 food images + confidence bar | 3 s | 3 s |
| **ISI** | Central `+` | — | 0.5, 1.5 or 2.5 s (mean 1.5 s), jittered |
| **Feedback** | Outcome image: allergy (+) or no allergy (−) | 1 s | 1 s |
| **ITI** | Central `+` | — | 1.5, 2.5 or 3.5 s (mean 2.5 s), jittered |
| **Trial length** | | **5 s (fixed)** | **6–10 s (mean 8 s)** |

- **Response**: participants respond with the `0` (no allergy) / `1` (allergy) keys **during the cue only**. The **first key pressed** is the recorded choice, and only that key can fill the confidence bar; the other key is ignored for the rest of the trial. Holding the key fills the bar up to 100%. The cue always lasts the full 3 s; neither a response nor a full bar ends it.
- **Feedback** always shows the true outcome for that trial type, whatever the participant responded. It is not accuracy feedback.
- All screens have fixed durations, so the task is not self-paced and no event depends on the participant's response time.

**Original (behavioral), 5 s per trial**
```
|-- + --|------------ CUE ------------|-- FB --|-- + --|------------ CUE ...
   1 s               3 s                 1 s     1 s
```

**fMRI-friendly, 6–10 s per trial (mean 8 s)**
```
|------------ CUE ------------|---- + ----|-- FB --|------ + ------|------------ CUE ...
             3 s               ISI 0.5–2.5 s  1 s     ITI 1.5–3.5 s
```

### Jitter Design

ISI and ITI durations are drawn from fixed lists **for each trial type within each phase**, so every trial type in every phase has exactly the same mean ISI (1.5 s) and mean ITI (2.5 s):

| Phase | Repetitions per trial type | ISI list (s) | ITI list (s) |
|-------|----------------------------|--------------|--------------|
| Learning | 10 | 0.5, 0.5, 0.5, 2.5, 2.5, 2.5, 1.5, 1.5, 1.5, 1.5 | 1.5, 1.5, 1.5, 3.5, 3.5, 3.5, 2.5, 2.5, 2.5, 2.5 |
| Blocking | 6 | 0.5, 0.5, 2.5, 2.5, 1.5, 1.5 | 1.5, 1.5, 3.5, 3.5, 2.5, 2.5 |
| Testing | 6 | 0.5, 0.5, 2.5, 2.5, 1.5, 1.5 | 1.5, 1.5, 3.5, 3.5, 2.5, 2.5 |

- Each trial type uses up its own lists over the phase, sampling without replacement, so the per-type means are exact.
- The ISI and ITI lists are **shuffled independently**, with no fixed ISI–ITI pairing. This keeps ISI and ITI uncorrelated across trials.
- Derived intervals in the fMRI-friendly version:
  - Cue onset → feedback onset: **3.5–5.5 s** (3 s cue + 0.5–2.5 s ISI)
  - Feedback offset → next cue onset: **1.5–3.5 s**
  - Cue onset → next cue onset (SOA): **6–10 s**
- Practice trials (3) use the mean values: ISI 1.5 s, ITI 2.5 s.
- Configured in `exp/var.js` (`stimuliDuration`, `feedbackDuration`, `isiDuration`, `itiDuration`, `jitter`).

### Trial Order

Within each phase, trials come in **mini-blocks**: each repetition shows every trial type of that phase once, in random order (10 mini-blocks in learning, 6 in blocking, 6 in testing). The three phases run back-to-back with no break or instruction screen between them.

### Task Duration

Durations count the main trials only. Practice trials and the self-paced instructions are not included. Because the jitter lists have fixed sums, the fMRI-friendly durations are **exact**, not averages.

| Stimulus set | Phase | Trials | Original (5 s/trial) | fMRI-friendly (8 s/trial) |
|--------------|-------|--------|----------------------|---------------------------|
| Standard | Learning | 70 (7 × 10) | 5 min 50 s | 9 min 20 s |
| Standard | Blocking | 42 (7 × 6) | 3 min 30 s | 5 min 36 s |
| Standard | Testing | 42 (7 × 6) | 3 min 30 s | 5 min 36 s |
| **Standard** | **Total** | **154** | **12 min 50 s** | **20 min 32 s** |
| Short | Total | 112 (40 + 42 + 30) | 9 min 20 s | 14 min 56 s |
| Practice | — | 3 | 15 s | 24 s |

### Logged Timing Data

- Each cue row stores `isi_duration` and `iti_duration` (ms) for that trial.
- ISI and ITI screens are saved as their own rows with `test_part` = `"isi"` / `"iti"`.
- `time_elapsed` (ms since the experiment started) can be used to rebuild cue, feedback, and response onsets for the GLM.

### Open Points for fMRI Review

- **Scanner synchronization**: the task does not yet wait for a scanner trigger (TTL pulse). Onsets are relative to the start of the browser session, not to the first volume.
- **Baseline / run structure**: there are no initial or final fixation periods, and all three phases run as one continuous block (~20.5 min with the Standard set). Splitting into separate runs (e.g., one per phase) and adding fixation periods at the start and end of each run may be preferable.
- **Response–cue overlap**: the response window is the cue period itself, so motor activity overlaps with cue/prediction activity.
- **Jitter range**: is ISI 0.5–2.5 s and ITI 1.5–3.5 s enough to separate cue- and feedback-related responses efficiently at the planned TR?
- **Timing precision**: presentation uses jsPsych/browser timers, so durations are accurate to about one screen refresh (~16 ms at 60 Hz).

## 🛠 Development Guide

### Install and Configure XAMPP
1. [Download XAMPP](https://www.apachefriends.org/download.html) with PHP version 7.3.19
2. Open XAMPP and click "Start" to boot the application.
3. Navigate to "Services" and click "Start All".
4. Navigate to "Network", select localhost:8080, and click "Enable".
5. Navigate to "Volumes" and click "Mount".

### Clone the Git Repository
6. Open Terminal and navigate to the `htdocs` directory:
   - **Mac/Linux:**
     ```bash
     cd ~/.bitnami/stackman/machines/xampp/volumes/root/htdocs
     ```
   - **Windows:**
     ```bash
     cd C:\xampp\htdocs
     ```
7. Clone into `htdocs`:
   ```bash
   git clone https://github.com/belieflab/kaminBlocking.git
   ```

### Modify Permissions
8. Copy this text into your terminal from the `htdocs` folder:
   ```bash
   sudo chmod -R 777 foodAllergy/
   ```
        
### Start Experiment
9. Click this URL: [http://localhost:8080/kaminBlocking](http://localhost:8080/kaminBlocking)
      
### View the Source Code
10. Open the `kaminBlocking` directory in a text editor of your choice. We prefer [Visual Studio Code](https://code.visualstudio.com/):
    - **Mac/Linux:**
      ```bash
      cd ~/.bitnami/stackman/machines/xampp/volumes/root/htdocs/kaminBlocking
      ```
    - **Windows:**
      ```bash
      cd C:\xampp\htdocs\kaminBlocking
      ```

## 🌐 Hosting Guide  

### Clone the Git Repository
1. Open Terminal and navigate to your server's default directory:
   - **Apache Linux default directory:**
     ```bash
     cd /var/www/html
     ```
2. Clone the repository:
   ```bash
   git clone --recurse-submodules -j4 git@github.com:belieflab/kaminBlocking.git && cd kaminBlocking && git submodule foreach --recursive 'git checkout $(git config -f $toplevel/.gitmodules submodule.$name.branch || echo main)' && git update-index --assume-unchanged exp/conf.js
   ```

### Modify Permissions
3. Execute these two `chmod` commands in terminal from `/var/www/html`:
   ```bash
   sudo chmod -R 755 foodAllergy/
   sudo chmod -R 777 foodAllergy/data
   ```

> **Note:** This version is correct!
