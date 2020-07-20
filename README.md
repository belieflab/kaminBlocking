# foodAllergy
description

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

        cd C://xampp//htdocs

7. Clone into htdocs:

        git clone https://github.com/belieflab/foodAllergy.git

#### Modifty permissions:
8. Copy this text into your terminal from the htdocs folder (the folder you are already in).

        sudo chmod -R 777 foodAllergy/
        
#### Start experiment:     
9. Click this URL: [http://localhost:8080/foodAllergy](http://localhost:8080/foodAllergy)
      
      
      
### BRAVO! You're a XAMPP master.



## Hosting Guide

#### Clone the git repository:
1. Open Terminal and navigate to the your server's default directory:

    Apache Linux:

        cd /var/www/html

2. Clone respository:

        git clone https://github.com/belieflab/foodAllery.git

#### Modifty permissions:
3. Copy this text into your terminal from the /var/www/html folder (the folder you are already in).

        sudo chmod -R 755 foodAllergy/
        sudo chmod -R 777 foodAllergy/data
        
        
