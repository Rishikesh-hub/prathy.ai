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

print_info(r'c:\Users\thanu\OneDrive\Desktop\assault\drug_food_project\dug_dataset\PubChem_compound_FDA_approved_drugs (1).csv', 'Drug')
print_info(r'c:\Users\thanu\OneDrive\Desktop\assault\drug_food_project\food_dataset\Compound (1).csv', 'Food')
print_info(r'c:\Users\thanu\OneDrive\Desktop\assault\drug_food_project\training_dataset\00_training.csv', 'Training')
