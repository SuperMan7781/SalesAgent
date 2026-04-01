import csv
import random

first_names = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon", "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy", "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna", "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma", "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Frank", "Debra", "Alexander", "Rachel", "Raymond", "Catherine", "Patrick", "Carolyn", "Jack", "Janet", "Dennis", "Ruth", "Jerry", "Maria", "Tyler", "Heather"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]
companies = ["Acme", "TechStartup", "GrowthCo", "Innovatech", "CloudSynergy", "DataSolutions", "AlphaLogic", "BetaSystems", "GammaCorp", "DeltaWeb", "EpsilonTech", "ZetaIndustries", "EtaSoft", "ThetaDynamics", "IotaGroup", "KappaEnterprises", "LambdaNetworks", "MuVentures", "NuHoldings", "XiConsulting", "OmicronPartners", "PiTechnologies", "RhoInnovations", "SigmaAnalytics", "TauCapital", "UpsilonLabs", "PhiDesigns", "ChiSystems", "PsiLogistics", "OmegaCorp"]
titles = ["CEO", "CTO", "CIO", "VP Engineering", "VP Sales", "Director of IT", "Head of Growth", "Chief Marketing Officer", "Director of Engineering", "Engineering Manager", "Lead Developer", "Product Manager", "Sales Manager", "VP Marketing", "Chief Revenue Officer", "Head of Data", "Data Scientist", "Software Engineer", "Operations Manager", "Founder"]

with open('s:/Dev/Work/SalesAgent/test_leads_100.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['first_name', 'last_name', 'email', 'company', 'title', 'linkedin_url'])
    for i in range(100):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        company = random.choice(companies)
        title = random.choice(titles)
        email = f"{fname.lower()}.{lname.lower()}@{company.lower()}.com"
        linkedin = f"https://linkedin.com/in/{fname.lower()}{lname.lower()}{random.randint(1,999)}"
        writer.writerow([fname, lname, email, company, title, linkedin])

print("Generated 100 leads successfully in test_leads_100.csv")
