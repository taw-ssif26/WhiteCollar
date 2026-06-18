# core/templatetags/custom_filters.py
from django import template

register = template.Library()

@register.filter
def split(value, delimiter):
    """
    Split a string by a delimiter and return a list.
    Usage: {{ value|split:"--" }}
    Example: "2012 - Founded|2018 - Accredited|Present - Innovation"|split:"|"
    """
    if value:
        return value.split(delimiter)
    return []

@register.filter
def get_item(value, key):
    """Get an item from a dictionary"""
    return value.get(key, '')

@register.filter
def to_list(value):
    """Convert a string to a list (split by newlines)"""
    if value:
        return value.split('\n')
    return []
