CREATE TABLE vote_histories (
  id INT(11) AUTO_INCREMENT NOT NULL, 
  device_id INT(11) NOT NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  PRIMARY KEY (id)
);
