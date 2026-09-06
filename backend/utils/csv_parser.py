import pandas as pd
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
    Parse CSV bytes into student dicts.
    Returns (valid_rows, errors).
    Errors are human-readable strings the admin can understand.
    """
    try:
        # dtype=str prevents pandas from stripping leading zeros from phone numbers
        df = pd.read_csv(io.BytesIO(file_bytes), dtype=str)
    except Exception as e:
        return [], [f"Could not read CSV file: {str(e)}"]

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
    df.rename(columns=COLUMN_ALIASES, inplace=True)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        return [], [f"CSV is missing required columns: {', '.join(missing)}. Required: {', '.join(REQUIRED_COLUMNS)}"]

    valid_rows = []
    errors = []

    for idx, row in df.iterrows():
        row_num = idx + 2  # 1-indexed, +1 for header
        row_errors = []

        name = str(row.get("name", "")).strip()
        whatsapp = str(row.get("whatsapp_number", "")).strip()
        gender = str(row.get("gender", "")).strip().lower()

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
            "school_college": str(row.get("school_college", "")).strip(),
            "class_level": str(row.get("class_level", "")).strip(),
            "batch": str(row.get("batch", "")).strip(),
            "gender": gender,
            "whatsapp_number": whatsapp,
            "email": str(row.get("email", "")).strip() or None,
        })

    return valid_rows, errors
