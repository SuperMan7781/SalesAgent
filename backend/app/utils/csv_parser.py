# s:\Dev\Work\SalesAgent\backend\app\utils\csv_parser.py
import csv
import io
from typing import List, Dict

# Smart column mapping: common CSV header names → our field names
COLUMN_MAP = {
    "first_name": ["first_name", "first name", "firstname", "given name", "name"],
    "last_name": ["last_name", "last name", "lastname", "surname", "family name"],
    "email": ["email", "email address", "e-mail", "email_address", "work email"],
    "company": ["company", "company name", "organization", "org", "company_name"],
    "title": ["title", "job title", "job_title", "role", "position", "designation"],
    "linkedin_url": ["linkedin", "linkedin_url", "linkedin url", "linkedin profile", "profile url"],
}

def detect_column(header: str) -> str:
    """Match a CSV header to our standardized field name."""
    header_lower = header.strip().lower()
    for field, aliases in COLUMN_MAP.items():
        if header_lower in aliases:
            return field
    return ""

def parse_csv_leads(csv_content: str) -> List[Dict]:
    """Parse CSV content and auto-map columns to our lead schema."""
    reader = csv.DictReader(io.StringIO(csv_content))

    if not reader.fieldnames:
        return []

    # Build column mapping
    mapping = {}
    for header in reader.fieldnames:
        mapped = detect_column(header)
        if mapped:
            mapping[header] = mapped

    # Parse rows
    leads = []
    for row in reader:
        lead = {}
        for csv_col, our_field in mapping.items():
            lead[our_field] = row.get(csv_col, "").strip()

        # Skip rows without email
        if lead.get("email"):
            leads.append(lead)

    return leads
