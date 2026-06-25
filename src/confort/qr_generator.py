#!/usr/bin/env python3
"""Generate QR code for Confort+ production application."""

import sys
from pathlib import Path

import qrcode


def generate_qr_code(app_url: str, output_file: str = "confort-qr-code.png") -> str:
    """
    Generate a QR code linking to the Confort+ application.

    Args:
        app_url: Production URL of the Confort+ app (e.g., https://confort-pay.com)
        output_file: Output filename for the QR code PNG

    Returns:
        Path to the generated QR code file

    Raises:
        ValueError: If app_url is invalid
    """
    if not app_url.startswith(("http://", "https://")):
        raise ValueError(f"Invalid URL: {app_url}. Must start with http:// or https://")

    qr = qrcode.QRCode(
        version=1,  # Controls the size of the QR code (1-40)
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Highest error correction
        box_size=10,  # Size of each box in pixels
        border=2,  # Border width in boxes
    )
    qr.add_data(app_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_file)

    output_path = Path(output_file).resolve()
    return str(output_path)


def main():
    """CLI entry point for QR code generation."""
    if len(sys.argv) < 2:
        print("Usage: python qr_generator.py <app_url> [output_file]")
        print("Example: python qr_generator.py https://confort-pay.com confort-qr.png")
        sys.exit(1)

    app_url = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "confort-qr-code.png"

    try:
        file_path = generate_qr_code(app_url, output_file)
        print(f"✓ QR code generated successfully: {file_path}")
        print(f"  URL: {app_url}")
        print('  Print size: 100mm × 100mm (4" × 4") recommended')
        print("  Resolution: High quality PNG, ready for printing")
    except ValueError as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
    except ImportError:
        print("✗ Error: qrcode library not found. Install with: pip install qrcode[pil]")
        sys.exit(1)


if __name__ == "__main__":
    main()
