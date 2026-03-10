#!/bin/bash
# Quick verification script for the Quran app setup

echo "🔍 Verifying Free Alquran App Setup..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node --version)"
else
    echo "❌ Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm $(npm --version)"
else
    echo "❌ npm not found"
fi

# Check Expo CLI
if command -v expo &> /dev/null; then
    echo "✅ Expo CLI installed"
else
    echo "⚠️  Expo CLI not found - install with: npm install -g expo-cli"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules not found - run: npm install"
fi

# Check key files
echo ""
echo "📦 Checking project files..."

files=(
    "app/_layout.tsx"
    "app/(tabs)/_layout.tsx"
    "app/(tabs)/index.tsx"
    "app/(tabs)/read.tsx"
    "app/(tabs)/bookmark.tsx"
    "types/quran.ts"
    "services/quran-api.ts"
    "services/quran-storage.ts"
    "hooks/use-quran.tsx"
    "package.json"
    "tsconfig.json"
    "app.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
    fi
done

echo ""
echo "🚀 Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. npm install           # Install all dependencies"
echo "2. npm run android       # Run on Android emulator"
echo "3. Or: expo start        # Start dev server and choose 'a' for Android"
