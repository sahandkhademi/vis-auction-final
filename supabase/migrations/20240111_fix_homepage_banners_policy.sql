-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active banners" ON homepage_banners;

-- Create new policy that allows anyone to view banners
CREATE POLICY "Public can view active banners"
ON homepage_banners
FOR SELECT
TO public
USING (true);