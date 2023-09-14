package com.saudiacatering.inships.repository;

import org.springframework.stereotype.Repository;

import com.saudiacatering.inships.model.User;

@Repository
public class UserRepository {

	 public User findUserByEmail(String email){
	        User user = new User(email,"123456");
	        user.setFirstName("FirstName");
	        user.setLastName("LastName");
	        return user;
	    }
}
