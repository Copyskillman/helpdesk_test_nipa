#!/usr/bin/env python
"""
Simple test runner script for the helpdesk application.
This script sets up the Django environment and runs tests.
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def setup_django():
    """Set up Django environment for testing"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.test_settings')
    django.setup()

def run_tests(test_labels=None, verbosity=1, interactive=True):
    """Run the test suite"""
    setup_django()
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=verbosity, interactive=interactive)
    
    if not test_labels:
        test_labels = ['tests']
    
    failures = test_runner.run_tests(test_labels)
    
    if failures:
        sys.exit(1)
    else:
        print("\nAll tests passed!")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Run helpdesk tests')
    parser.add_argument('test_labels', nargs='*', 
                       help='Test labels to run (default: all tests)')
    parser.add_argument('-v', '--verbosity', type=int, default=2,
                       help='Verbosity level (0-3)')
    parser.add_argument('--no-interactive', action='store_false', dest='interactive',
                       help='Run tests non-interactively')
    
    args = parser.parse_args()
    
    print("Running Helpdesk Tests...")
    print("=" * 50)
    
    run_tests(
        test_labels=args.test_labels or None,
        verbosity=args.verbosity,
        interactive=args.interactive
    )