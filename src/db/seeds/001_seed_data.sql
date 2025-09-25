-- Insert seed categories
INSERT
  OR IGNORE INTO categories(name, description)
    VALUES ('Environment', 'Petitions related to environmental protection and sustainability'),
('Education', 'Petitions about educational policies and reforms'),
('Healthcare', 'Petitions concerning healthcare access and policies'),
('Social Justice', 'Petitions advocating for social equality and justice'),
('Transportation', 'Petitions about public transportation and infrastructure'),
('Local Government', 'Petitions related to local government policies'),
('Animal Rights', 'Petitions for animal welfare and protection'),
('Technology', 'Petitions about technology policies and digital rights');

-- Insert seed users
INSERT
  OR IGNORE INTO users(first_name, last_name, email, anonymous)
    VALUES ('John', 'Doe', 'john.doe@example.com', FALSE),
('Jane', 'Smith', 'jane.smith@example.com', FALSE),
('Anonymous', 'User', 'anon1@example.com', TRUE),
('Maria', 'Garcia', 'maria.garcia@example.com', FALSE),
('David', 'Wilson', 'david.wilson@example.com', FALSE),
('Sarah', 'Johnson', 'sarah.johnson@example.com', FALSE);

-- Insert seed petitions
INSERT
  OR IGNORE INTO petitions(title, description, type, image_url, target_count, location, created_by, status)
    VALUES ('Save Our Local Park', 'The city council is planning to sell our beloved Central Park to developers. This 50-acre green space has been the heart of our community for over 80 years. It provides recreational opportunities for families, serves as a habitat for local wildlife, and helps improve our air quality. We need your signature to show the council that our community values this irreplaceable resource.', 'local', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 5000, 'Springfield, MA', 1, 'active'),
('Universal Healthcare for All Americans', 'Healthcare is a human right, not a privilege. Every American deserves access to quality healthcare regardless of their economic status. Countries around the world have successfully implemented universal healthcare systems that provide better outcomes at lower costs. It''s time for the United States to join them and ensure that no one goes bankrupt due to medical bills or dies because they cannot afford treatment.', 'national', 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800', 100000, NULL, 2, 'active'),
('Improve School Bus Safety in Our District', 'Our children deserve safe transportation to and from school. Recent incidents involving outdated school buses breaking down and lacking proper safety equipment have put our kids at risk. We are calling on the school district to allocate funds for newer, safer buses equipped with GPS tracking, improved braking systems, and better emergency exits.', 'local', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800', 2500, 'Riverside School District, CA', 3, 'active'),
('Ban Single-Use Plastics Nationwide', 'Single-use plastics are choking our planet. Every year, millions of tons of plastic waste end up in our oceans, killing marine life and entering our food chain. Many countries and cities have already banned or restricted single-use plastics with great success. We urge Congress to pass legislation banning single-use plastic bags, straws, and containers nationwide.', 'national', 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800', 75000, NULL, 4, 'active'),
('Fund After-School Programs at Lincoln Elementary', 'Budget cuts have eliminated vital after-school programs at Lincoln Elementary, leaving working parents without childcare and children without educational enrichment opportunities. These programs provided homework help, arts and crafts, sports activities, and a safe environment for kids whose parents work late. We need the school board to restore funding for these essential programs.', 'local', 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800', 1500, 'Lincoln Elementary, Portland, OR', 5, 'active');

-- Insert petition categories relationships
INSERT
  OR IGNORE INTO petition_categories(petition_id, category_id)
    VALUES (1, 1), -- Save Our Local Park -> Environment
(1, 6), -- Save Our Local Park -> Local Government
(2, 3), -- Universal Healthcare -> Healthcare
(3, 2), -- School Bus Safety -> Education
(3, 5), -- School Bus Safety -> Transportation
(3, 6), -- School Bus Safety -> Local Government
(4, 1), -- Ban Single-Use Plastics -> Environment
(5, 2), -- After-School Programs -> Education
(5, 6);

-- After-School Programs -> Local Government
-- Insert some sample signatures
INSERT
  OR IGNORE INTO signatures(petition_id, user_id, comment, anonymous)
    VALUES (1, 2, 'This park is where I learned to ride my bike. We cannot let it be destroyed!', FALSE),
(1, 4, 'Our family has been using this park for generations. Please save it!', FALSE),
(1, 6, NULL, TRUE),
(2, 1, 'Healthcare should be a right, not a privilege. Count me in!', FALSE),
(2, 3, 'I have seen too many people suffer because they cannot afford medical care.', TRUE),
(2, 5, 'Other countries have proven this works. America can do it too!', FALSE),
(3, 4, 'As a parent, I worry about my child''s safety on those old buses every day.', FALSE),
(3, 6, 'The current buses are falling apart. Our kids deserve better.', FALSE),
(4, 1, 'Plastic pollution is destroying our oceans. We need action now!', FALSE),
(4, 2, 'I support any effort to reduce plastic waste and protect our environment.', FALSE),
(5, 3, 'These programs were a lifeline for working parents like me.', TRUE),
(5, 5, 'After-school programs keep kids safe and engaged. They must be funded.', FALSE);

