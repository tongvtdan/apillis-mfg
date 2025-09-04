import React from 'react';
import { DaisyUITabs, DaisyUITabsList, DaisyUITabsTrigger, DaisyUITabsContent } from '@/components/ui/daisyui-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example component demonstrating DaisyUI tabs with custom colors
 * This shows how to use the new unified tab system with CSS custom properties
 */
export function DaisyUITabsExample() {
    return (
        <div className="space-y-8 p-6">
            <div>
                <h2 className="text-2xl font-bold mb-4">DaisyUI Tabs with Custom Colors</h2>
                <p className="text-base-content/70 mb-6">
                    Examples of using DaisyUI tabs with custom colors using CSS custom properties
                </p>
            </div>

            {/* Example 1: Basic Lift Tabs with Primary Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Lift Tabs (Primary Colors)</CardTitle>
                </CardHeader>
                <CardContent>
                    <DaisyUITabs defaultValue="tab1" variant="lift">
                        <DaisyUITabsList>
                            <DaisyUITabsTrigger value="tab1">Tab 1</DaisyUITabsTrigger>
                            <DaisyUITabsTrigger value="tab2">Tab 2</DaisyUITabsTrigger>
                            <DaisyUITabsTrigger value="tab3">Tab 3</DaisyUITabsTrigger>
                        </DaisyUITabsList>

                        <DaisyUITabsContent value="tab1">
                            <div className="p-4 bg-base-200 rounded-lg">
                                <h3 className="font-semibold mb-2">Tab 1 Content</h3>
                                <p>This tab uses default primary colors from the theme.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="tab2">
                            <div className="p-4 bg-base-200 rounded-lg">
                                <h3 className="font-semibold mb-2">Tab 2 Content</h3>
                                <p>This tab also uses default primary colors.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="tab3">
                            <div className="p-4 bg-base-200 rounded-lg">
                                <h3 className="font-semibold mb-2">Tab 3 Content</h3>
                                <p>This tab also uses default primary colors.</p>
                            </div>
                        </DaisyUITabsContent>
                    </DaisyUITabs>
                </CardContent>
            </Card>

            {/* Example 2: Custom Orange Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom Orange Colors</CardTitle>
                </CardHeader>
                <CardContent>
                    <DaisyUITabs defaultValue="orange1" variant="lift">
                        <DaisyUITabsList>
                            <DaisyUITabsTrigger
                                value="orange1"
                                activeColor="white"
                                activeBgColor="orange"
                                activeBorderColor="orange"
                            >
                                Orange Tab 1
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="orange2"
                                activeColor="white"
                                activeBgColor="orange"
                                activeBorderColor="orange"
                            >
                                Orange Tab 2
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="orange3"
                                activeColor="white"
                                activeBgColor="orange"
                                activeBorderColor="orange"
                            >
                                Orange Tab 3
                            </DaisyUITabsTrigger>
                        </DaisyUITabsList>

                        <DaisyUITabsContent value="orange1">
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Orange Tab 1 Content</h3>
                                <p>This tab uses custom orange colors.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="orange2">
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Orange Tab 2 Content</h3>
                                <p>This tab uses custom orange colors.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="orange3">
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Orange Tab 3 Content</h3>
                                <p>This tab uses custom orange colors.</p>
                            </div>
                        </DaisyUITabsContent>
                    </DaisyUITabs>
                </CardContent>
            </Card>

            {/* Example 3: Boxed Tabs with Custom Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Boxed Tabs with Custom Colors</CardTitle>
                </CardHeader>
                <CardContent>
                    <DaisyUITabs defaultValue="boxed1" variant="boxed">
                        <DaisyUITabsList>
                            <DaisyUITabsTrigger
                                value="boxed1"
                                activeColor="white"
                                activeBgColor="#10b981"
                                activeBorderColor="#10b981"
                            >
                                Success Tab
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="boxed2"
                                activeColor="white"
                                activeBgColor="#f59e0b"
                                activeBorderColor="#f59e0b"
                            >
                                Warning Tab
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="boxed3"
                                activeColor="white"
                                activeBgColor="#ef4444"
                                activeBorderColor="#ef4444"
                            >
                                Error Tab
                            </DaisyUITabsTrigger>
                        </DaisyUITabsList>

                        <DaisyUITabsContent value="boxed1">
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Success Tab Content</h3>
                                <p>This tab uses custom green colors.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="boxed2">
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Warning Tab Content</h3>
                                <p>This tab uses custom yellow colors.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="boxed3">
                            <div className="p-4 bg-red-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Error Tab Content</h3>
                                <p>This tab uses custom red colors.</p>
                            </div>
                        </DaisyUITabsContent>
                    </DaisyUITabs>
                </CardContent>
            </Card>

            {/* Example 4: Bordered Tabs with Purple Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Bordered Tabs with Purple Colors</CardTitle>
                </CardHeader>
                <CardContent>
                    <DaisyUITabs defaultValue="bordered1" variant="bordered">
                        <DaisyUITabsList>
                            <DaisyUITabsTrigger
                                value="bordered1"
                                activeColor="white"
                                activeBgColor="#8b5cf6"
                                activeBorderColor="#8b5cf6"
                            >
                                Purple Tab 1
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="bordered2"
                                activeColor="white"
                                activeBgColor="#8b5cf6"
                                activeBorderColor="#8b5cf6"
                            >
                                Purple Tab 2
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="bordered3"
                                activeColor="white"
                                activeBgColor="#8b5cf6"
                                activeBorderColor="#8b5cf6"
                            >
                                Purple Tab 3
                            </DaisyUITabsTrigger>
                        </DaisyUITabsList>

                        <DaisyUITabsContent value="bordered1">
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Purple Tab 1 Content</h3>
                                <p>This tab uses custom purple colors with bordered variant.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="bordered2">
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Purple Tab 2 Content</h3>
                                <p>This tab uses custom purple colors with bordered variant.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="bordered3">
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Purple Tab 3 Content</h3>
                                <p>This tab uses custom purple colors with bordered variant.</p>
                            </div>
                        </DaisyUITabsContent>
                    </DaisyUITabs>
                </CardContent>
            </Card>

            {/* Example 5: Mixed Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Mixed Colors Example</CardTitle>
                </CardHeader>
                <CardContent>
                    <DaisyUITabs defaultValue="mixed1" variant="lift">
                        <DaisyUITabsList>
                            <DaisyUITabsTrigger
                                value="mixed1"
                                activeColor="white"
                                activeBgColor="#3b82f6"
                                activeBorderColor="#3b82f6"
                            >
                                Blue Tab
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="mixed2"
                                activeColor="white"
                                activeBgColor="#ec4899"
                                activeBorderColor="#ec4899"
                            >
                                Pink Tab
                            </DaisyUITabsTrigger>
                            <DaisyUITabsTrigger
                                value="mixed3"
                                activeColor="white"
                                activeBgColor="#06b6d4"
                                activeBorderColor="#06b6d4"
                            >
                                Cyan Tab
                            </DaisyUITabsTrigger>
                        </DaisyUITabsList>

                        <DaisyUITabsContent value="mixed1">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Blue Tab Content</h3>
                                <p>This tab uses custom blue colors.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="mixed2">
                            <div className="p-4 bg-pink-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Pink Tab Content</h3>
                                <p>This tab uses custom pink colors.</p>
                            </div>
                        </DaisyUITabsContent>

                        <DaisyUITabsContent value="mixed3">
                            <div className="p-4 bg-cyan-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Cyan Tab Content</h3>
                                <p>This tab uses custom cyan colors.</p>
                            </div>
                        </DaisyUITabsContent>
                    </DaisyUITabs>
                </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Basic Usage:</h4>
                            <pre className="bg-base-300 p-3 rounded text-sm overflow-x-auto">
                                {`<DaisyUITabs defaultValue="tab1" variant="lift">
  <DaisyUITabsList>
    <DaisyUITabsTrigger value="tab1">Tab 1</DaisyUITabsTrigger>
    <DaisyUITabsTrigger value="tab2">Tab 2</DaisyUITabsTrigger>
  </DaisyUITabsList>
  
  <DaisyUITabsContent value="tab1">
    Content for tab 1
  </DaisyUITabsContent>
  
  <DaisyUITabsContent value="tab2">
    Content for tab 2
  </DaisyUITabsContent>
</DaisyUITabs>`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Custom Colors:</h4>
                            <pre className="bg-base-300 p-3 rounded text-sm overflow-x-auto">
                                {`<DaisyUITabsTrigger 
  value="tab1"
  activeColor="white"
  activeBgColor="orange"
  activeBorderColor="orange"
>
  Custom Orange Tab
</DaisyUITabsTrigger>`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Available Variants:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><code>lift</code> - Tabs appear to lift when active</li>
                                <li><code>boxed</code> - Tabs in a boxed container</li>
                                <li><code>bordered</code> - Tabs with borders</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Color Properties:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><code>activeColor</code> - Text color when active</li>
                                <li><code>activeBgColor</code> - Background color when active</li>
                                <li><code>activeBorderColor</code> - Border color when active</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
