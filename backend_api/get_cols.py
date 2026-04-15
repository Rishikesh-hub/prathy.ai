import pandas as pd
import sys

def print_info(path, label):
    print(f"--- {label} ---")
    try:
        df = pd.read_csv(path, nrows=1)
        print("Columns:")
        for col in df.columns:
            if 'smile' in col.lower() or 'name' in col.lower() or 'id' in col.lower():
                print(f"  {col}")
    except Exception as e:
        print(e)
    print()

print_info(r'c:\Users\Rishikesh\Desktop\G-1152\DFI\prathy.ai\dug_dataset\PubChem_compound_FDA_approved_drugs (1).csv', 'Drug')
print_info(r'c:\Users\Rishikesh\Desktop\G-1152\DFI\prathy.ai\food_dataset\Compound (1).csv', 'Food')
print_info(r'c:\Users\Rishikesh\Desktop\G-1152\DFI\prathy.ai\training_dataset\00_training.csv', 'Training')
