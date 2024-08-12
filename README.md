```
git clone --recurse-submodules -j4 git@github.com:belieflab/kaminBlocking.git && cd kaminBlocking && git submodule foreach --recursive 'git checkout $(git config -f $toplevel/.gitmodules submodule.$name.branch || echo main)' && git update-index --assume-unchanged exp/conf.js
```

variables:

version = 'corrected' version appears after error disovered in testing_stimuli, the consistent-allergy conidition had a stimulus 2 pairing, which should never have been the case. Per Phil Corlett, previous data is not compromised for key trial types. However, low level controls (I-,J+) should not be used in combined analysis of tasks without version 'correct' variable!

# Kamin Blocking
This is a psychological task designed to track new causal belief formation. It involves subjects learning to associate causes (foods) with effects (allergies in a fictitious patient).

The scenario is as follows: subjects imagine they are an allergist and they are charged with figuring our which foods cause allergies in a fictitious patient and which ones do not. They see each meal he has eaten (comprised of one or two different foods) , for 3 seconds then they see whether or not an allergy happened (for one second). When a meal is on the screen, they make a prediction with a 2-alternative button push (allergy or no allergy).

# Alternate versions
Three new versions were developed that (a) use different instructions/framing contexts (social vs. nonsocial), (b) different stimuli (social avatars vs. fractals), and (c) have shorter format based on (Ongchoco et al., 2023)

# design 
learning_phase  blocking_phase  testing_phase
A1+             A1B1+           B1+
A2+             A2B2+           B2-
C1-             C1D1+           D1+
C2-             C2D2+           D2-
F-              EF-             EF-
I+              I+              I+
J-              J-              J-
Total cues: A1, A2, B1, B2, C1, C2, D1, D2, E, F, I, J,

cues within stim_shuffle: standard version (until 11), short (until 13). SCdO 07/may/2024
                0   1   2   3   4   5   6   7    8   9   10  11  12  13
stim_shuffle = [A1, A2, B1, B2, C1, C2, D1, D2,  E,  F,  I,  J,  K,  L]

# Git branches and latest version
If you want to use the latest version (v7 wrapper) this will be under the branch v7. Then you can clone it by: git clone --branch v7 --recurse-submodules git@github.com:belieflab/kaminBlocking.git kaminBlocking. The branch master is being used for CAPR project, and will be depricated after the project.


## Development Guide

#### Install and configure XAMPP:
1. [Download XAMPP](https://www.apachefriends.org/download.html) with PHP version 7.3.19
2. Open XAMPP and click "Start" to boot the XAMPP application.
3. Navigate to "Services" and click "Start All" button.
4. Navigate to "Network", select localhost:8080, and click "Enable".
5. Navigate to "Volumes" and click "Mount".

#### Clone the git repository:
6. Open Terminal and navigate to the htdocs directory:

    Mac/Linux:

        cd ~/.bitnami/stackman/machines/xampp/volumes/root/htdocs
    Windows:

        cd C:\\xampp\\htdocs

7. Clone into htdocs:

        git clone https://github.com/belieflab/foodAllergy.git

#### Modify permissions:
8. Copy this text into your terminal from the htdocs folder (the folder you are already in).

        sudo chmod -R 777 foodAllergy/
        
#### Start experiment:     
9. Click this URL: [http://localhost:8080/foodAllergy](http://localhost:8080/foodAllergy)
      
#### View the source code:  
10. Open the foodAllergy directory in a text editor of your choice. We prefer [Visual Studio Code](https://code.visualstudio.com/)

    Mac/Linux:

        cd ~/.bitnami/stackman/machines/xampp/volumes/root/htdocs/foodAllergy

    Windows:

        cd C:\\xampp\\htdocs\\foodAllergy

## Hosting Guide  

#### Clone the git repository:
1. Open Terminal and navigate to the your server's default directory:

    Apache Linux default directory:

        cd /var/www/html

2. Clone respository:

        git clone https://github.com/belieflab/foodAllery.git

#### Modify permissions:
3. Execute these two chmod commands in terminal from  /var/www/html (the directory you are already in).

        sudo chmod -R 755 foodAllergy/
        sudo chmod -R 777 foodAllergy/data
        
this version is correct!        
