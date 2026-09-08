import csv
import io
from typing import Any

REQUIRED_COLUMNS = {"name", "school_college", "class_level", "batch", "gender", "whatsapp_number"}

COLUMN_ALIASES = {
    "school": "school_college",
    "college": "school_college",
    "class": "class_level",
    "phone": "whatsapp_number",
    "mobile": "whatsapp_number",
    "whatsapp": "whatsapp_number",
}


def parse_student_csv(file_bytes: bytes) -> tuple[list[dict[str, Any]], list[str]]:
    """
    Parse CSV bytes into student dicts using Python's built-in csv module.
    Returns (valid_rows, errors).
    """
    try:
        text = file_bytes.decode("utf-8-sig")  # strips BOM if present
        reader = csv.DictReader(io.StringIO(text))
    except Exception as e:
        return [], [f"Could not read CSV file: {str(e)}"]

    # Normalize column names
    if reader.fieldnames is None:
        return [], ["CSV file is empty or has no header row."]

    normalized_fields = [f.strip().lower().replace(" ", "_") for f in reader.fieldnames]
    aliased_fields = [COLUMN_ALIASES.get(f, f) for f in normalized_fields]

    missing = REQUIRED_COLUMNS - set(aliased_fields)
    if missing:
        return [], [
            f"CSV is missing required columns: {', '.join(sorted(missing))}. "
            f"Required: {', '.join(sorted(REQUIRED_COLUMNS))}"
        ]

    valid_rows = []
    errors = []

    for idx, row in enumerate(reader):
        row_num = idx + 2  # 1-indexed + header row

        # Remap keys using normalized + aliased field names
        normalized_row: dict[str, str] = {}
        for original_key, aliased_key in zip(reader.fieldnames or [], aliased_fields):
            normalized_row[aliased_key] = (row.get(original_key) or "").strip()

        name = normalized_row.get("name", "")
        whatsapp = normalized_row.get("whatsapp_number", "")
        gender = normalized_row.get("gender", "").lower()

        row_errors = []
        if not name:
            row_errors.append("Name is empty")
        if not whatsapp or len(whatsapp) < 10:
            row_errors.append("WhatsApp number is missing or too short")
        if gender not in {"male", "female", "other"}:
            row_errors.append(f"Gender must be 'male', 'female', or 'other' (got: '{gender}')")

        if row_errors:
            errors.append(f"Row {row_num} ({name or 'unknown'}): {'; '.join(row_errors)}")
            continue

        valid_rows.append({
            "name": name,
            "school_college": normalized_row.get("school_college", ""),
            "class_level": normalized_row.get("class_level", ""),
            "batch": normalized_row.get("batch", ""),
            "gender": gender,
            "whatsapp_number": whatsapp,  # preserved exactly as typed — no numeric conversion
            "email": normalized_row.get("email", "") or None,
        })

    return valid_rows, errors
