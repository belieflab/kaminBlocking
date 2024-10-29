# 🧠 Kamin Blocking

This psychological task investigates the Kamin blocking phenomenon, where participants predict outcomes based on their interactions with different stimuli. In the **social version**, participants are presented with co-workers (represented as emojis) and need to predict whether they will help or sabotage their efforts. In the **non-social version**, subjects associate foods with allergic reactions.

## 🚀 Getting Started

### Clone the Repository
To clone the repository with all necessary submodules, run:
```bash
git clone --recurse-submodules -j4 git@github.com:belieflab/kaminBlocking.git && cd kaminBlocking && git submodule foreach --recursive 'git checkout $(git config -f $toplevel/.gitmodules submodule.$name.branch || echo main)' && git update-index --assume-unchanged exp/conf.js
```

### Version Information
- **Version**: 'corrected' version appears after an error discovered in `testing_stimuli`. The "consistent-allergy" condition had a stimulus 2 pairing, which should never have been the case. Per Phil Corlett, previous data is not compromised for key trial types. However, low-level controls (I-, J+) should not be used in combined analysis of tasks without the 'correct' version variable!

## 🎯 Task Description
Participants will be shown meals (comprising one or two different foods for the non-social version or emojis representing co-workers for the social version) for 3 seconds. They will then have 1 second to determine if an allergy occurred or if they believe a co-worker will help or sabotage them.

## 📊 Alternate Versions

1. **Non-Social Kamin Blocking**
   - **Trials**: 154 total (+3 practice trials)
   - **Cues**: 12 cues including "A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E", "F", "I", "J"
   - Participants imagine they are allergists observing a new patient who has allergic reactions after certain meals.
   - They predict whether the meals will cause allergic reactions based on previous observations of patient reactions.
   - **Trial Structure**:
     - **Learning Phase**: 7 stimuli each presented 10 times (1:10) / A1+, A2+, C1-, C2-, F-, I+, J-
     - **Blocking Phase**: 7 stimuli each presented 6 times (11:16) / A1B1+, A2B2+, C1D1+, D2D2+, EF-, I+, J-
     - **Testing Phase**: 7 stimuli each presented 6 times (17:22) / B1+, B2-, D1+, D2-, EF-, I+, J-

2. **Social Kamin Blocking**
   - **Trials**: 112 total (+3 practice trials)
   - **Cues**: 14 cues including "A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E", "F", "I", "J", "K", "L"
   - Participants imagine starting a new job, where they are evaluated by a boss and rely on co-workers, who may help or sabotage them.
   - They predict whether the co-workers will help or sabotage them after observing their actions during the experiment.
   - **Trial Structure**:
     - **Learning Phase**: 4 stimuli each presented 10 times (1:10) / A1+, A2+, C1-, C2-
     - **Blocking Phase**: 7 stimuli each presented 6 times (11:16) / A1B1+, A2B2+, C1D1+, C2D2+, EF-, IK-, JL-
     - **Testing Phase**: 5 stimuli each presented 6 times (17:22) / B1+, B2-, D1+, D2-, L-

### Cues Overview
**Non-Social Kamin Blocking**
| Learning Phase | Blocking Phase | Testing Phase |
|----------------|----------------|---------------|
| A1+           | A1B1+         | B1+           |
| A2+           | A2B2+         | B2-           |
| C1-           | C1D1+         | D1+           |
| C2-           | C2D2+         | D2-           |
| F-            | EF-           | EF-           |
| I+            | I+            | I+            |
| J-            | J-            | J-            |

**Social Kamin Blocking**
| Learning Phase | Blocking Phase | Testing Phase |
|----------------|----------------|---------------|
| A1+           | A1B1+         | B1+           |
| A2+           | A2B2+         | B2-           |
| C1-           | C1D1+         | D1+           |
| C2-           | C2D2+         | D2-           |
| F-            | EF-           | EF-           |
| I+            | I+            | I+            |
| J-            | J-            | J-            |
| K-            | K-            | K-            |
| L-            | L-            | L-            |

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
   git clone https://github.com/belieflab/foodAllergy.git
   ```

### Modify Permissions
8. Copy this text into your terminal from the `htdocs` folder:
   ```bash
   sudo chmod -R 777 foodAllergy/
   ```
        
### Start Experiment
9. Click this URL: [http://localhost:8080/foodAllergy](http://localhost:8080/foodAllergy)
      
### View the Source Code
10. Open the `foodAllergy` directory in a text editor of your choice. We prefer [Visual Studio Code](https://code.visualstudio.com/):
    - **Mac/Linux:**
      ```bash
      cd ~/.bitnami/stackman/machines/xampp/volumes/root/htdocs/foodAllergy
      ```
    - **Windows:**
      ```bash
      cd C:\xampp\htdocs\foodAllergy
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
   git clone https://github.com/belieflab/foodAllergy.git
   ```

### Modify Permissions
3. Execute these two `chmod` commands in terminal from `/var/www/html`:
   ```bash
   sudo chmod -R 755 foodAllergy/
   sudo chmod -R 777 foodAllergy/data
   ```

> **Note:** This version is correct!
