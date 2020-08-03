# load the data folder with indfiles
setwd("/Applications/XAMPP/xamppfiles/htdocs/foodAllergy/scripts/preprocessing/rawdata")


# read all data
fname = list.files(pattern="*.csv")
raw_data = lapply(fname, function(i){
  read.csv(i,header=TRUE,check.names = FALSE)
})

# read data

N = length(raw_data)
id.value <- vector(mode = "list", length = N)
full.data <- vector(mode = "list", length = N)
acc.mat <- array(0, dim=c(N, 154))
learning.acc <- vector(mode = "list", length = N)
learning.acc.pos <- vector(mode = "list", length = N)
learning.acc.neg <- vector(mode = "list", length = N)

blocking.acc <- vector(mode = "list", length = N)
blocking.acc.blocking <- vector(mode = "list", length = N)
blocking.acc.blockingControl <- vector(mode = "list", length = N)
blocking.acc.noAllergyControl <- vector(mode = "list", length = N)
blocking.acc.consistentAllergy <- vector(mode = "list", length = N)
blocking.acc.consistentNoAllergy <- vector(mode = "list", length = N)

testing.acc <- vector(mode = "list", length = N)
testing.acc.blockingViolation <- vector(mode = "list", length = N)
testing.acc.blockingConfirmation <- vector(mode = "list", length = N)
testing.acc.blockingConfirmationControl <- vector(mode = "list", length = N)
testing.acc.blockingViolationControl <- vector(mode = "list", length = N)
testing.acc.noAllergyControl <- vector(mode = "list", length = N)
testing.acc.consistentAllergy <- vector(mode = "list", length = N)
testing.acc.consistentNoAllergy <- vector(mode ="list", length = N)
# want a list that contains data frames for each particpant with 

# loop through all subjects
for (i in 1:N){
  
  temp = list.files(pattern="*.csv")
  id.value[[i]] = substring(temp[i], regexpr("_", temp[i]) + 1, nchar(temp[i])-4)
  
  # pull out columns of interest for each person 
  current.id = id.value[[i]]
  full.data[[i]] = raw_data[[i]][ which((raw_data[[i]]$test_part=="learning")|(raw_data[[i]]$test_part=="blocking")|(raw_data[[i]]$test_part=="testing")),c("trial_index","test_part", "reaction", "role", "accuracy")]
  
  full.data[[i]]$id = rep(current.id, nrow(full.data[[i]]))
  
  for (j in 1:154)
  {
    acc.mat[i, j] = full.data[[i]]$accuracy[j]
  }
  
  
  
  
  # want number of correct trials of a specific type over number of those specific trials
  # starting with the learning phase
  
  learning.acc[[i]] = sum(full.data[[i]][which(full.data[[i]]$test_part=="learning"), 
                      "accuracy"], na.rm=T)/length(full.data[[i]][which(full.data[[i]]$test_part==
                        "learning"), "accuracy"])
  learning.acc.pos[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="learning")&
                                              (full.data[[i]]$role =="singlePositive")), "accuracy"], na.rm=T)/
                            length(full.data[[i]][which((full.data[[i]]$test_part=="learning")&
                                              (full.data[[i]]$role =="singlePositive")), "accuracy"])
  
  learning.acc.neg[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="learning")&
                                              (full.data[[i]]$role =="singleNegative")), "accuracy"], na.rm=T)/
                              length(full.data[[i]][which((full.data[[i]]$test_part=="learning")&
                                  (full.data[[i]]$role =="singleNegative")), "accuracy"])
  
  # blocking phase
  blocking.acc[[i]] = sum(full.data[[i]][which(full.data[[i]]$test_part=="blocking"), 
                                         "accuracy"], na.rm=T)/length(full.data[[i]][which(full.data[[i]]$test_part==
                                                                                       "blocking"), "accuracy"])
  blocking.acc.blocking[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                                     (full.data[[i]]$role =="blocking")), "accuracy"], na.rm=T)/
                        length(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                  (full.data[[i]]$role =="blocking")), "accuracy"])
  
  blocking.acc.noAllergyControl[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                                      (full.data[[i]]$role =="noAllergyControl")), "accuracy"], na.rm=T)/
                        length(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                  (full.data[[i]]$role =="noAllergyControl")), "accuracy"])
  
  blocking.acc.blockingControl[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                                          (full.data[[i]]$role =="blockingControl")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                  (full.data[[i]]$role =="blockingControl")), "accuracy"])
  
  blocking.acc.consistentAllergy[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                                          (full.data[[i]]$role =="consistentAllergy")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                  (full.data[[i]]$role =="consistentAllergy")), "accuracy"])
  
  blocking.acc.consistentNoAllergy[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                                                   (full.data[[i]]$role =="consistentNoAllergy")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="blocking")&
                                  (full.data[[i]]$role =="consistentNoAllergy")), "accuracy"])
                                                                                     
                                                                                     
  
  #testing phase                                                                                  
  testing.acc[[i]] = sum(full.data[[i]][which(full.data[[i]]$test_part=="testing"), 
                                         "accuracy"], na.rm=T)/length(full.data[[i]][which(full.data[[i]]$test_part==
                                                                                       "testing"), "accuracy"])
  testing.acc.blockingViolation[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                                          (full.data[[i]]$role =="blockingViolation")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                  (full.data[[i]]$role =="blockingViolation")), "accuracy"])
  
  testing.acc.blockingConfirmation[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                                                  (full.data[[i]]$role =="blockingConfirmation")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                  (full.data[[i]]$role =="blockingConfirmation")), "accuracy"])
  
  testing.acc.noAllergyControl[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                                                  (full.data[[i]]$role =="noAllergyControl")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                  (full.data[[i]]$role =="noAllergyControl")), "accuracy"])
  
  testing.acc.blockingConfirmationControl[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                                                 (full.data[[i]]$role =="blockingConfirmationControl")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                  (full.data[[i]]$role =="blockingConfirmationControl")), "accuracy"])
  testing.acc.blockingViolationControl[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                                                            (full.data[[i]]$role =="blockingViolationControl")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                  (full.data[[i]]$role =="blockingViolationControl")), "accuracy"])
  
  testing.acc.consistentAllergy[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                                                   (full.data[[i]]$role =="consistentAllergy")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                  (full.data[[i]]$role =="consistentAllergy")), "accuracy"])
  
  testing.acc.consistentNoAllergy[[i]] = sum(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                                                     (full.data[[i]]$role =="consistentNoAllergy")), "accuracy"], na.rm=T)/
    length(full.data[[i]][which((full.data[[i]]$test_part=="testing")&
                                  (full.data[[i]]$role =="consistentNoAllergy")), "accuracy"])
  
  
 
  

 
  
  
}

# dataframes for accuracy based on overall accuracy and then phase based accuracy of various types of trials!
accuracy.data.overall<- data.frame(id = unlist(id.value),
                            learning.phase = unlist(testing.acc),
                            blocking.phase = unlist(blocking.acc),
                            testing.phase = unlist(testing.acc))

accuracy.learning.phase <- data.frame(id = unlist(id.value),
                                      pos = unlist(learning.acc.pos),
                                      neg = unlist(learning.acc.neg))

accuracy.blocking.phase <- data.frame(id = unlist(id.value),
                                 blocking = unlist(blocking.acc.blocking),
                                 blocking.control = unlist(blocking.acc.blockingControl),
                                 no.allergy.control = unlist(blocking.acc.noAllergyControl),
                                 consistent.allergy = unlist(blocking.acc.consistentAllergy),
                                 consistent.no.allergy = unlist(blocking.acc.consistentNoAllergy))
                                
                                    
accuracy.testing.phase<- data.frame(id = unlist(id.value),
                                   violation = unlist(testing.acc.blockingViolation), 
                                   confirmation = unlist(testing.acc.blockingConfirmation),
                                   confirmation.control = unlist(testing.acc.blockingConfirmationControl),
                                   violation.control = unlist(testing.acc.blockingViolationControl),
                                   no.allergy.control = unlist(testing.acc.noAllergyControl),
                                   consistent.allergy = unlist(testing.acc.consistentAllergy),
                                   consistent.no.allergy = unlist(testing.acc.consistentNoAllergy))

# sum over the columns to get averages for a certain trial
sum.mat.acc = colSums(acc.mat,na.rm=T, dims = 1)




                                   


                                   
                                   
                                    
                                    
                                    
    










