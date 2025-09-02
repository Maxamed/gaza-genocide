#!/usr/bin/env python3
import json
import os

def load_json_file(filename):
    """Load and parse a JSON file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return []

def merge_benchmarks():
    """Merge all three benchmark files into one comprehensive dataset"""
    
    # Load all three files
    current = load_json_file('data/benchmarks.json')
    new_bench = load_json_file('data/new_bench.json')
    new_bench1 = load_json_file('data/new_bench1.json')
    
    print(f"Loaded benchmarks:")
    print(f"  - Current: {len(current)} benchmarks")
    print(f"  - New bench: {len(new_bench)} benchmarks")
    print(f"  - New bench1: {len(new_bench1)} benchmarks")
    
    # Combine all benchmarks
    all_benchmarks = []
    
    # Add current benchmarks
    all_benchmarks.extend(current)
    
    # Add new_bench benchmarks (avoid duplicates by ID)
    existing_ids = {b['id'] for b in all_benchmarks}
    for benchmark in new_bench:
        if benchmark['id'] not in existing_ids:
            all_benchmarks.append(benchmark)
            existing_ids.add(benchmark['id'])
        else:
            print(f"  - Skipped duplicate ID: {benchmark['id']}")
    
    # Add new_bench1 benchmarks (avoid duplicates by ID)
    for benchmark in new_bench1:
        if benchmark['id'] not in existing_ids:
            all_benchmarks.append(benchmark)
            existing_ids.add(benchmark['id'])
        else:
            print(f"  - Skipped duplicate ID: {benchmark['id']}")
    
    print(f"\nMerged dataset: {len(all_benchmarks)} total benchmarks")
    
    # Count categories
    categories = {}
    for b in all_benchmarks:
        cat = b.get('category', 'unknown')
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\nCategory distribution:")
    for cat, count in sorted(categories.items()):
        print(f"  - {cat}: {count} benchmarks")
    
    # Save merged file
    output_file = 'data/benchmarks_merged.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_benchmarks, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Merged file saved to: {output_file}")
    print(f"📊 Total unique benchmarks: {len(all_benchmarks)}")
    
    return all_benchmarks

if __name__ == "__main__":
    merge_benchmarks() 