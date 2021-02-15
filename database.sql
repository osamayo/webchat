CREATE DATABASE webchat DEFAULT CHARSET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

CREATE USER 'username'@'localhost';
GRANT ALL PRIVILEGES ON webchat.* To 'username'@'localhost' IDENTIFIED BY 'user_pass';

USE webchat;

CREATE TABLE `email_confirmation` (
	`code` varchar(30) NOT NULL PRIMARY KEY,
	`username` varchar(20) NOT NULL,
	`email` varchar(50) NOT NULL,
	`fname` varchar(20) NOT NULL,
	`lname` varchar(20) NOT NULL,
	`password` varchar(50) NOT NULL,
	`time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE `user` (
	`username` varchar(20) NOT NULL PRIMARY KEY,
	`email` varchar(50) NOT NULL,
	`fname` varchar(20) NOT NULL,
	`lname` varchar(20) NOT NULL,
	`password` varchar(50) NOT NULL,
	`register_time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE `contacts` (
	`username` varchar(20) NOT NULL,
	`contact_username` varchar(20) NOT NULL,
	CONSTRAINT `contacts_fk` FOREIGN KEY (`username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT `contacts_fk2` FOREIGN KEY (`contact_username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chats_ids` (
	`id` INT AUTO_INCREMENT PRIMARY KEY,
	`username` varchar(20) NOT NULL,
	`contact_username` varchar(20) NOT NULL,
	CONSTRAINT `user_chats_fk` FOREIGN KEY (`username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT `user_chats_fk2` FOREIGN KEY (`contact_username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chats` (
	`id` INT NOT NULL,
	`from` varchar(20) NOT NULL,
	`to` varchar(20) NOT NULL,
	`time` int(11) NOT NULL,
	`message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	CONSTRAINT `chats_fk` FOREIGN KEY (`from`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT `chats_fk2` FOREIGN KEY (`to`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT `chats_fk3` FOREIGN KEY (`id`) REFERENCES `chats_ids` (`id`) ON DELETE CASCADE ON UPDATE CASCADE 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

