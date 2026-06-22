"""Minimal tests for the confort package."""

from confort import hello


def test_hello_default():
    assert hello() == "Hello, world!"


def test_hello_custom_name():
    assert hello("CI") == "Hello, CI!"
