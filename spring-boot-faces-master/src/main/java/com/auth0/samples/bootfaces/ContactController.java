package com.auth0.samples.bootfaces;

import com.google.common.collect.Lists;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/contacts/")
public class ContactController {
    private static final List<Contact> contacts = Lists.newArrayList(
            new Contact("Bruno Krebs","+5551987654321"),
            new Contact("John Doe","+5551987654321") );

    @GetMapping
    public List<Contact> getContacts() {
        return contacts;
    }

    @PostMapping
    public void addContact(@RequestBody Contact contact) {
        contacts.add(contact);
    }
}